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
        if query and content is not None:
            if query in content:
                return result
        else:
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
            'details': hashlock_tx_condition.to_dict(),
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


def escrow_asset(bigchain, source, to, asset_id, sk,
                 expires_at=None, ilp_header=None, execution_condition=None):
    asset = bigchain.get_transaction(asset_id['txid'])
    payload = asset['transaction']['data']['payload'].copy()
    if ilp_header:
        payload.update({'ilp_header': ilp_header})

    # Create escrow template with the execute and abort address
    asset_escrow = bigchain.create_transaction(source, [source, to], asset_id, 'TRANSFER',
                                               payload=payload)
    if not expires_at:
        # Set expiry time (100 secs from now)
        time_sleep = 100
        expires_at = float(bigchaindb.util.timestamp()) + time_sleep

    # Create escrow and timeout condition
    condition_escrow = cc.ThresholdSha256Fulfillment(threshold=1)  # OR Gate
    condition_timeout = cc.TimeoutFulfillment(expire_time=str(expires_at))  # only valid if now() <= time_expire
    condition_timeout_inverted = cc.InvertedThresholdSha256Fulfillment(threshold=1)
    condition_timeout_inverted.add_subfulfillment(condition_timeout)

    # Create execute branch
    execution_threshold = 3 if execution_condition else 2
    condition_execute = cc.ThresholdSha256Fulfillment(threshold=execution_threshold)  # AND gate
    condition_execute.add_subfulfillment(cc.Ed25519Fulfillment(public_key=to))  # execute address
    condition_execute.add_subfulfillment(condition_timeout)  # federation checks on expiry
    if execution_condition:
        condition_execute.add_subcondition_uri(execution_condition)
    condition_escrow.add_subfulfillment(condition_execute)

    # Create abort branch
    condition_abort = cc.ThresholdSha256Fulfillment(threshold=2)  # AND gate
    condition_abort.add_subfulfillment(cc.Ed25519Fulfillment(public_key=source))  # abort address
    condition_abort.add_subfulfillment(condition_timeout_inverted)
    condition_escrow.add_subfulfillment(condition_abort)

    # Update the condition in the newly created transaction
    asset_escrow['transaction']['conditions'][0]['condition'] = {
        'details': condition_escrow.to_dict(),
        'uri': condition_escrow.condition.serialize_uri()
    }

    # conditions have been updated, so hash needs updating
    asset_escrow['id'] = bigchaindb.util.get_hash_data(asset_escrow)

    # sign transaction
    asset_escrow_signed = bigchaindb.util.sign_tx(asset_escrow, sk, bigchain=bigchain)
    bigchain.write_transaction(asset_escrow_signed)
    return asset_escrow_signed


def fulfill_escrow_asset(bigchain, source, to, asset_id, sk, execution_fulfillment=None):
    asset = bigchain.get_transaction(asset_id['txid'])
    asset_owners = asset['transaction']['conditions'][asset_id['cid']]['new_owners']

    other_owner = [owner for owner in asset_owners if not owner == source][0]

    # Create a base template for fulfill transaction
    asset_escrow_fulfill = bigchain.create_transaction(asset_owners, to, asset_id, 'TRANSFER',
                                                       payload=asset['transaction']['data']['payload'])

    # Parse the threshold cryptocondition
    escrow_fulfillment = cc.Fulfillment.from_dict(
        asset['transaction']['conditions'][0]['condition']['details'])

    # Get the fulfillment message to sign
    tx_escrow_execute_fulfillment_message = \
        bigchaindb.util.get_fulfillment_message(asset_escrow_fulfill,
                                                asset_escrow_fulfill['transaction']['fulfillments'][0],
                                                serialized=True)

    # get the indices path for the source that wants to fulfill
    _, indices = get_subcondition_indices_from_vk(escrow_fulfillment, source)
    subfulfillment_source = escrow_fulfillment
    for index in indices:
        subfulfillment_source = subfulfillment_source.subconditions[index]['body']

    # sign the fulfillment
    subfulfillment_source.sign(tx_escrow_execute_fulfillment_message, bigchaindb.crypto.SigningKey(sk))

    # get the indices path for the other source that delivers the condition
    _, indices = get_subcondition_indices_from_vk(escrow_fulfillment, other_owner)
    subfulfillment_other = escrow_fulfillment.subconditions[indices[0]]['body']

    # update the condition
    del escrow_fulfillment.subconditions[indices[0]]
    escrow_fulfillment.add_subcondition(subfulfillment_other.condition)

    if execution_fulfillment:
        _, indices = get_subcondition_indices_from_type(escrow_fulfillment, cc.PreimageSha256Fulfillment.TYPE_ID)
        del escrow_fulfillment.subconditions[indices[0]]['body'].subconditions[indices[1]]
        escrow_fulfillment.subconditions[indices[0]]['body'].add_subfulfillment_uri(execution_fulfillment)

    asset_escrow_fulfill['transaction']['fulfillments'][0]['fulfillment'] = escrow_fulfillment.serialize_uri()

    bigchain.write_transaction(asset_escrow_fulfill)
    return asset_escrow_fulfill


def get_subcondition_indices_from_vk(condition, vk):
    if isinstance(vk, str):
        vk = vk.encode()

    conditions = []
    indices = []
    for i, c in enumerate(condition.subconditions):
        if isinstance(c['body'], cc.Ed25519Fulfillment) and c['body'].public_key.to_ascii(encoding='base58') == vk:
            indices.append(i)
            conditions.append(c['body'])
            break
        elif isinstance(c['body'], cc.ThresholdSha256Fulfillment):
            result, index = get_subcondition_indices_from_vk(c['body'], vk)
            if result:
                conditions += result
                indices += [i]
                indices += index
                break
    return conditions, indices


def get_subcondition_indices_from_type(condition, type_id):
    conditions = []
    indices = []
    for i, c in enumerate(condition.subconditions):
        if c['body'].type_id == type_id:
            indices.append(i)
            conditions.append(c['body'])
            break
        elif isinstance(c['body'], cc.ThresholdSha256Fulfillment):
            result, index = get_subcondition_indices_from_type(c['body'], type_id)
            if result:
                conditions += result
                indices += [i]
                indices += index
                break
    return conditions, indices
