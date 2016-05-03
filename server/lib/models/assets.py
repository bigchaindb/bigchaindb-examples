import json
from time import sleep
from datetime import datetime

import rethinkdb as r

import cryptoconditions as cc
from decorator import contextmanager

import bigchaindb
import bigchaindb.util


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
        reql_query = r.table(table) \
            .filter(lambda tx: tx['transaction']['conditions']
                    .contains(lambda c: c['new_owners']
                              .contains(vk)))
        response = query_reql_response(reql_query.run(bigchain.conn), query)
        if response:
            assets += response

    elif table == 'bigchain':
        for asset_id in asset_ids:
            txid = asset_id['txid'] if isinstance(asset_id, dict) else asset_id

            reql_query = r.table(table)\
                .concat_map(lambda doc: doc['block']['transactions']) \
                .filter(lambda transaction: transaction['id'] == txid)
            response = query_reql_response(reql_query.run(bigchain.conn), query)
            if response:
                assets += response

    return assets


def get_assets(bigchain, search):
    if search:
        cursor = r.db('bigchain')\
            .table('bigchain')\
            .concat_map(lambda doc: doc["block"]["transactions"]
                        .filter(lambda transaction: transaction["transaction"]["data"]["payload"]["content"]
                                .match(search)))\
            .run(bigchain.conn)
    else:
        cursor = r.db('bigchain') \
            .table('bigchain') \
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
