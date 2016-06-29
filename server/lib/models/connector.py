import threading
import multiprocessing
from itertools import groupby

import rethinkdb as r

from bigchaindb import Bigchain
from server.lib.models.accounts import get_connectors
from server.lib.models.accounts import retrieve_accounts


class Connector(object):

    def __init__(self, account1, account2):
        self.accounts = {}
        self.add_accounts(account1)
        self.add_accounts(account2)

    def add_accounts(self, account):
        self.accounts[account['ledger']['id']] = {
            'account': account,
            'connection': Bigchain(dbname='bigchaindb_examples_{}'.format(account['ledger']['id']))
        }

    def listen_events(self):
        listeners = []
        for ledger_id in self.accounts.keys():
            listen = threading.Thread(target=self._listen_events, args=(ledger_id,))
            listen.start()
            listeners.append(listen)

        for listen in listeners:
            listen.join()

    def handle_escrow(self, tx, ledger_id):
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

    def _listen_events(self, ledger_id):
        ledger = self.accounts[ledger_id]['connection']
        for change in r.table('bigchain').changes().run(ledger.conn):
            if change['old_val'] is None:
                self._handle_block(change['new_val'], ledger_id)

    def _handle_block(self, block, ledger_id):
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
        vk = self.accounts[ledger_id]['account']['vk']

        for transaction in block['block']['transactions']:
            current_owners = transaction['transaction']['fulfillments'][0]['current_owners']
            new_owners = transaction['transaction']['conditions'][0]['new_owners']

            # 1.
            if vk not in current_owners and sorted(new_owners) == sorted([vk] + current_owners):
                print('chloe received escrow {}'.format(transaction['id']))
                self.handle_escrow(transaction, ledger_id)
            # 2.
            elif current_owners == [vk]:
                print('skip {}'.format(transaction['id']))
            # 3.
            elif vk in current_owners and vk not in new_owners:
                print('hashlock fulfilled {}'.format(transaction['id']))
                self.handle_execute(transaction)
            # 4.
            elif new_owners == [vk]:
                print('skip {}'.format(transaction['id']))


def get_connector_accounts(db='interledger'):
    b = Bigchain()
    connector_accounts = []
    accounts_db = retrieve_accounts(b, db)

    for name, accounts in groupby(sorted(accounts_db, key=lambda d: d['name']), key=lambda d: d['name']):
        accounts = list(accounts)
        if len(accounts) == 2:
            connector_accounts.append(tuple(accounts))

    return connector_accounts


def run_connector(account1, account2):
    c = Connector(account1=account1, account2=account2)
    c.listen_events()


if __name__ == '__main__':
    connector_accounts = get_connector_accounts()
    connector_procs = []

    for connector_account in connector_accounts:
        print('Starting connector: {} <--- {} ---> {}'.format(connector_account[0]['ledger']['id'],
                                                              connector_account[0]['name'],
                                                              connector_account[1]['ledger']['id']))

        connector_proc = multiprocessing.Process(target=run_connector, args=connector_account)
        connector_proc.start()
        connector_procs.append(connector_proc)

    for connector_proc in connector_procs:
        connector_proc.join()

