import threading

import rethinkdb as r

from bigchaindb import Bigchain
from server.lib.models.assets import escrow_asset


connector_sk = 'EBceArfSnHRZvqKRqbcGiVoJ7op5L6pWa5u3atVnD2Kx'
connector_vk = '2MBzgDqY9M635gG2FPzRZJaWsC1sZQr5sHBfvyxw5uSK'


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

    def handle_escrow(self, tx, ledger):
        print('called handle_escrow {}'.format(tx['id']))

        # escrow_asset(bigchain=ledger,
        #              source=source,
        #              to=to,
        #              asset_id=asset_id,
        #              sk=sk,
        #              expires_at=expires_at,
        #              ilp_header=ilp_header,
        #              execution_condition=execution_condition)

    def handle_execute(self, tx):
        print('called handle_execute {}'.format(tx['id']))

    def _listen_events(self, ledger):
        for change in r.table('bigchain').changes().run(ledger.conn):
            if change['old_val'] is None:
                self._handle_block(change['new_val'], ledger)

    def _handle_block(self, block, ledger):
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
                self.handle_escrow(transaction, ledger)
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

if __name__ == '__main__':
    c = Connector(connector_vk, connector_sk, 0, 0)
    c.listen_events()

