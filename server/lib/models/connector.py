import time
import threading

import rethinkdb as r

import bigchaindb.util
import bigchaindb.crypto
from bigchaindb import Bigchain
import cryptoconditions as cc

connector_sk = 'EBceArfSnHRZvqKRqbcGiVoJ7op5L6pWa5u3atVnD2Kx'
connector_vk = '2MBzgDqY9M635gG2FPzRZJaWsC1sZQr5sHBfvyxw5uSK'


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

    return tx_escrow


class Connector(object):

    def __init__(self, vk, sk, ledger_a, ledger_b):
        port_a = 28015 + ledger_a
        port_b = 28015 + ledger_b
        self.ledger_a = Bigchain(port=port_a)
        self.ledger_b = Bigchain(port=port_b)
        self.vk = vk
        self.sk = sk
        self.assets_a = self._create_assets(self.ledger_a)
        self.assets_b = self._create_assets(self.ledger_b)

    def listen_events(self):
        listen_a = threading.Thread(target=self._listen_events, args=(self.ledger_a,))
        listen_a.start()
        listen_b = threading.Thread(target=self._listen_events, args=(self.ledger_b,))
        listen_b.start()

        listen_a.join()
        listen_b.join()

    def handle_escrow(self, tx):
        print('called handle_escrow {}'.format(tx['id']))

    def handle_execute(self, tx):
        print('called handle_execute {}'.format(tx['id']))

    def _listen_events(self, ledger):
        for change in r.table('bigchain').changes().run(ledger.conn):
            if change['old_val'] is None:
                self._handle_block(change['new_val'])

    def _handle_block(self, block):
        """
        1. Alice          ---> [Alice, Chloe] ledger_a
        2. Chloe          ---> [Chloe, Bob]   ledger_b
        3. [Chloe, Bob]   ---> Bob            ledger_b
        4. [Alice, Chloe] ---> Chloe          ledger_a


        1. If chloe not in current owners and if new_owners = [current_owner, chloe] ---> escrow
        2. If current_owners == [chloe] do nothing
        3. If current_owners = [chloe, new_owner] and new_owners = [bob] ---> bob fulfilled hashlock
        4. If new_owner == [chloe] do nothing
        """
        for transaction in block['block']['transactions']:
            current_owners = transaction['transaction']['fulfillments'][0]['current_owners']
            new_owners = transaction['transaction']['conditions'][0]['new_owners']

            # 1.
            if self.vk not in current_owners and sorted(new_owners) == sorted([self.vk] + current_owners):
                print('chloe received escrow {}'.format(transaction['id']))
                self.handle_escrow(transaction)
            # 2.
            elif current_owners == [self.vk]:
                print('skip {}'.format(transaction['id']))
            # 3.
            elif self.vk in current_owners and self.vk not in new_owners:
                print('hashlock fulfilled {}'.format(transaction['id']))
                self.handle_execute(transaction)
            # 4.
            elif new_owners == [self.vk]:
                print('skip {}'.format(transaction['id']))

    def _create_assets(self, ledger):
        assets = []
        for i in range(50):
            tx = ledger.create_transaction(ledger.me, self.vk, None, 'CREATE')
            tx = ledger.sign_transaction(tx, ledger.me_private)
            ledger.write_transaction(tx)
            assets.append(tx['id'])
        return assets

