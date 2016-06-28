import time

import bigchaindb.util
import bigchaindb.crypto
from bigchaindb import Bigchain
import cryptoconditions as cc

connector_sk, connector_vk = bigchaindb.crypto.generate_key_pair()


def get_connectors():
    """Returns a list of connectors and quotes"""
    raise NotImplementedError


def create_escrow_tx(bigchain, source, to, asset_id, sk, hashlock_uri):
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
    condition_execute.add_subcondition_uri(hashlock_uri)  # execute address
    condition_execute.add_subfulfillment(condition_timeout)  # federation checks on expiry
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
    asset_escrow_signed = bigchain.sign_transaction(asset_escrow, sk)
    bigchain.write_transaction(asset_escrow_signed)
    return asset_escrow_signed


def fulfill_execute_tx(b, tx, to, preimage):
    hashlock_fulfill_tx = b.create_transaction(None, to, {'txid': tx['id'], 'cid': 0}, 'TRANSFER')
    hashlock_fulfillment = cc.PreimageSha256Fulfillment(preimage=preimage)
    hashlock_fulfill_tx['transaction']['fulfillments'][0]['fulfillment'] = hashlock_fulfillment.serialize_uri()
    return hashlock_fulfill_tx


def fulfill_abort():
    raise NotImplementedError


def create_escrow(frm, to, asset_id, amount, preimage, expiry, ledger, connector):
    """Create an escrow condition

    Args:
        frm (str): source public_key
        to (str): destination public key
        amount (int): decimal amount to transfer
        asset_id (dict): asset to transfer
        preimage (str): Agreed preimage for the hashlock
        expiry (int): number of seconds until the escrow expires
        ledger (str): destination ledger
        connector(str): public key of the connector
    """

    # Create the transaction
    b = Bigchain()
    payload = {
        'destination_account': to,
        'destination_amount': str(int(amount))
    }


def test():
    b = Bigchain()
    connector_sk, connector_vk = bigchaindb.crypto.generate_key_pair()
    alice_sk, alice_vk = bigchaindb.crypto.generate_key_pair()

    # create asset for alice
    print('creating asset for Alice')
    tx_create = b.create_transaction(b.me, alice_vk, None, 'CREATE')
    tx_create = b.sign_transaction(tx_create, b.me_private)
    assert b.is_valid_transaction(tx_create) == tx_create
    b.write_transaction(tx_create)
    time.sleep(6)

    # create hashlock condition
    secret = b'secret'
    hashlock_condition = cc.PreimageSha256Fulfillment(preimage=secret)

    # create escrow transaction
    print('creating escrow')
    tx_escrow = create_escrow_tx(b, alice_vk, connector_vk, {'txid': tx_create['id'], 'cid': 0},
                                 alice_sk, hashlock_condition.condition_uri)
    assert b.is_valid_transaction(tx_escrow) == tx_escrow
    b.write_transaction(tx_escrow)
    time.sleep(6)

    # fulfill execute
    print('executing escrow')
    tx_execute = fulfill_execute_tx(b, tx_escrow, connector_vk, secret)
    assert b.is_valid_transaction(tx_execute) == tx_execute
    b.write_transaction(tx_execute)

    return tx_create, tx_escrow, tx_execute


