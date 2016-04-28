import json
from time import sleep
from datetime import datetime

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


def get_owned_assets(bigchain, vk):
    asset_ids = bigchain.get_owned_ids(vk)
    assets = []
    for asset_id in asset_ids:
        result = bigchain.get_transaction(asset_id['txid'])
        if result:
            assets.append(result)
    return assets


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


def transfer_asset(bigchain, source, to, token, sk):
    token_transfer = bigchain.create_transaction(source, to, token, 'TRANSFER')
    token_transfer_signed = bigchain.sign_transaction(token_transfer, sk)
    bigchain.validate_transaction(token_transfer_signed)
    bigchain.write_transaction(token_transfer_signed)
    return token_transfer_signed