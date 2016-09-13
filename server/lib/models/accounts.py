import rethinkdb as r

import bigchaindb.crypto
from .assets import transfer_asset


class Account:
    def __init__(self, bigchain, name, ledger, db):
        self.bigchain = bigchain
        self.db = db
        self.name = name
        self.sk, self.vk = bigchaindb.crypto.generate_key_pair()
        self.ledger = ledger
        self.save()

    @property
    def assets(self):
        return self.bigchain.get_owned_ids(self.vk)

    def transfer(self, to, asset_id):
        return transfer_asset(bigchain=self.bigchain,
                              source=self.vk,
                              to=to,
                              asset_id=asset_id,
                              sk=self.sk)

    def save(self):
        try:
            r.db_create(self.db).run(self.bigchain.conn)
        except r.ReqlOpFailedError:
            pass

        try:
            r.db(self.db).table_create('accounts').run(self.bigchain.conn)
        except r.ReqlOpFailedError:
            pass

        user_exists = list(r.db(self.db)
                           .table('accounts')
                           .filter(lambda user: (user['name'] == self.name)
                                                & (user['ledger']['id'] == self.ledger['id']))
                           .run(self.bigchain.conn))
        if not len(user_exists):
            r.db(self.db)\
                .table('accounts')\
                .insert(self.as_dict(), durability='hard')\
                .run(self.bigchain.conn)
        else:
            user_persistent = user_exists[0]
            self.vk = user_persistent['vk']
            self.sk = user_persistent['sk']

    def as_dict(self):
        return {
            'name': self.name,
            'sk': self.sk,
            'vk': self.vk,
            'ledger': self.ledger
        }


def retrieve_accounts(bigchain, db):
    return list(r.db(db)
                .table('accounts')
                .run(bigchain.conn))


def get_connectors(bigchain, ledger_id, db):
    account_on_ledgers = \
        list(r.db(db)
              .table('accounts')
              .filter(lambda user: user['ledger']['id'] == int(ledger_id))
              .run(bigchain.conn))
    result = []
    for account_on_ledger in account_on_ledgers:
        account_on_multiple_ledgers = \
            list(r.db(db)
                  .table('accounts')
                  .filter(lambda user: user['name'] == account_on_ledger['name'])
                  .run(bigchain.conn))
        if len(account_on_multiple_ledgers) > 1:
            result += [account for account in account_on_multiple_ledgers if account['ledger']['id'] == int(ledger_id)]
    return result
