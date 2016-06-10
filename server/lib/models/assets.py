import json
from time import sleep
from datetime import datetime

import rethinkdb as r

import cryptoconditions as cc
from decorator import contextmanager

import bigchaindb
import bigchaindb.util
import bigchaindb.crypto


@contextmanager
def take_at_least_seconds(amount_in_seconds):
    t_issued = datetime.now()

    yield

    t_expired = datetime.now() - t_issued
    while t_expired.total_seconds() < amount_in_seconds:
        sleep(1)
        t_expired = datetime.now() - t_issued


def query_reql_response(response, query):
    result = list(response)

    if result and len(result):
        content = result[0]["transaction"]["data"]["payload"]["content"]
        if content:
            if (not query) or (query and query in content):
                return result
    return None


def get_owned_assets(bigchain, vk, query=None, table='bigchain'):
    assets = []
    asset_ids = bigchain.get_owned_ids(vk)

    if table == 'backlog':
        reql_query = \
            r.table(table) \
                .filter(lambda tx: tx['transaction']['conditions']
                        .contains(lambda c: c['new_owners']
                                  .contains(vk)))
        response = query_reql_response(reql_query.run(bigchain.conn), query)
        if response:
            assets += response

    elif table == 'bigchain':
        for asset_id in asset_ids:
            txid = asset_id['txid'] if isinstance(asset_id, dict) else asset_id

            reql_query = r.table(table) \
                .concat_map(lambda doc: doc['block']['transactions']) \
                .filter(lambda transaction: transaction['id'] == txid)
            response = query_reql_response(reql_query.run(bigchain.conn), query)
            if response:
                assets += response

    return assets


def get_assets(bigchain, search):
    if search:
        cursor = \
            r.table('bigchain') \
                .concat_map(lambda doc: doc["block"]["transactions"]
                            .filter(lambda transaction: transaction["transaction"]["data"]["payload"]["content"]
                                    .match(search))) \
                .run(bigchain.conn)
    else:
        cursor = \
            r.table('bigchain') \
                .concat_map(lambda doc: doc["block"]["transactions"]).run(bigchain.conn)
    return list(cursor)


def create_asset(bigchain, to, payload):
    # a create transaction uses the operation `CREATE` and has no inputs
    tx = bigchain.create_transaction(bigchain.me, to, None, 'CREATE', payload=payload)

    # all transactions need to be signed by the user creating the transaction
    tx_signed = bigchain.sign_transaction(tx, bigchain.me_private)

    bigchain.validate_transaction(tx_signed)
    # write the transaction to the bigchain
    bigchain.write_transaction(tx_signed)
    return tx_signed


def create_asset_hashlock(bigchain, payload, secret):
    # Create a hash-locked asset without any new_owners
    hashlock_tx = bigchain.create_transaction(bigchain.me, None, None, 'CREATE', payload=payload)

    hashlock_tx_condition = cc.PreimageSha256Fulfillment(preimage=secret.encode())

    # The conditions list is empty, so we need to append a new condition
    hashlock_tx['transaction']['conditions'].append({
        'condition': {
            'details': json.loads(hashlock_tx_condition.serialize_json()),
            'uri': hashlock_tx_condition.condition.serialize_uri()
        },
        'cid': 0,
        'new_owners': None
    })

    # Conditions have been updated, so hash needs updating
    hashlock_tx['id'] = bigchaindb.util.get_hash_data(hashlock_tx)

    # The asset needs to be signed by the current_owner
    hashlock_tx_signed = bigchain.sign_transaction(hashlock_tx, bigchain.me_private)

    bigchain.validate_transaction(hashlock_tx_signed)
    # write the transaction to the bigchain
    bigchain.write_transaction(hashlock_tx_signed)
    return hashlock_tx_signed


def transfer_asset(bigchain, source, to, asset_id, sk):
    asset = bigchain.get_transaction(asset_id['txid'])
    asset_transfer = bigchain.create_transaction(source, to, asset_id, 'TRANSFER',
                                                 payload=asset['transaction']['data']['payload'])
    asset_transfer_signed = bigchain.sign_transaction(asset_transfer, sk)
    bigchain.validate_transaction(asset_transfer_signed)
    bigchain.write_transaction(asset_transfer_signed)
    return asset_transfer_signed


def escrow_asset(bigchain, source, to, asset_id, sk):
    asset = bigchain.get_transaction(asset_id['txid'])
    # Create escrow template with the execute and abort address
    asset_escrow = bigchain.create_transaction(source, [source, to], asset_id, 'TRANSFER',
                                               payload=asset['transaction']['data']['payload'])

    # Set expiry time (100 secs from now)
    time_sleep = 100
    time_expire = str(float(bigchaindb.util.timestamp()) + time_sleep)

    # Create escrow and timeout condition
    condition_escrow = cc.ThresholdSha256Fulfillment(threshold=1)  # OR Gate
    condition_timeout = cc.TimeoutFulfillment(expire_time=time_expire)  # only valid if now() <= time_expire
    condition_timeout_inverted = cc.InvertedThresholdSha256Fulfillment(threshold=1)
    condition_timeout_inverted.add_subfulfillment(condition_timeout)

    # Create execute branch
    condition_execute = cc.ThresholdSha256Fulfillment(threshold=2)  # AND gate
    condition_execute.add_subfulfillment(cc.Ed25519Fulfillment(public_key=to))  # execute address
    condition_execute.add_subfulfillment(condition_timeout)  # federation checks on expiry
    condition_escrow.add_subfulfillment(condition_execute)

    # Create abort branch
    condition_abort = cc.ThresholdSha256Fulfillment(threshold=2)  # AND gate
    condition_abort.add_subfulfillment(cc.Ed25519Fulfillment(public_key=source))  # abort address
    condition_abort.add_subfulfillment(condition_timeout_inverted)
    condition_escrow.add_subfulfillment(condition_abort)

    # Update the condition in the newly created transaction
    asset_escrow['transaction']['conditions'][0]['condition'] = {
        'details': json.loads(condition_escrow.serialize_json()),
        'uri': condition_escrow.condition.serialize_uri()
    }

    # conditions have been updated, so hash needs updating
    asset_escrow['id'] = bigchaindb.util.get_hash_data(asset_escrow)

    # sign transaction
    asset_escrow_signed = bigchain.sign_transaction(asset_escrow, sk)
    bigchain.write_transaction(asset_escrow_signed)
    return asset_escrow_signed


def fulfill_escrow_asset(bigchain, source, to, asset_id, sk):
    asset = bigchain.get_transaction(asset_id['txid'])

    asset_new_owners = asset['transaction']['conditions'][0]['new_owners']

    # Create a base template for fulfill transaction
    asset_escrow_fulfill = bigchain.create_transaction(asset_new_owners, to, asset_id, 'TRANSFER',
                                                       payload=asset['transaction']['data']['payload'])

    # Parse the threshold cryptocondition
    escrow_fulfillment = cc.Fulfillment.from_json(
        asset['transaction']['conditions'][0]['condition']['details'])

    subfulfillment_user1 = escrow_fulfillment.get_subcondition_from_vk(asset_new_owners[0])[0]
    subfulfillment_user2 = escrow_fulfillment.get_subcondition_from_vk(asset_new_owners[1])[0]
    subfulfillment_timeout = escrow_fulfillment.subconditions[0]['body'].subconditions[1]['body']
    subfulfillment_timeout_inverted = escrow_fulfillment.subconditions[1]['body'].subconditions[1]['body']

    # Get the fulfillment message to sign
    tx_escrow_execute_fulfillment_message = \
        bigchaindb.util.get_fulfillment_message(asset_escrow_fulfill,
                                                asset_escrow_fulfill['transaction']['fulfillments'][0],
                                                serialized=True)

    escrow_fulfillment.subconditions = []

    # fulfill execute branch
    fulfillment_execute = cc.ThresholdSha256Fulfillment(threshold=2)
    subfulfillment_user2.sign(tx_escrow_execute_fulfillment_message, bigchaindb.crypto.SigningKey(sk))
    fulfillment_execute.add_subfulfillment(subfulfillment_user2)
    fulfillment_execute.add_subfulfillment(subfulfillment_timeout)
    escrow_fulfillment.add_subfulfillment(fulfillment_execute)

    # do not fulfill abort branch
    condition_abort = cc.ThresholdSha256Fulfillment(threshold=2)
    condition_abort.add_subfulfillment(subfulfillment_user1)
    condition_abort.add_subfulfillment(subfulfillment_timeout_inverted)
    escrow_fulfillment.add_subcondition(condition_abort.condition)

    # create fulfillment and append to transaction
    asset_escrow_fulfill['transaction']['fulfillments'][0]['fulfillment'] = escrow_fulfillment.serialize_uri()

    bigchain.write_transaction(asset_escrow_fulfill)
    return asset_escrow_fulfill
