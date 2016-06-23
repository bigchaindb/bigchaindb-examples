import rethinkdb as r

import bigchaindb.crypto
from .assets import transfer_asset

DB = 'examples'


class Account:
    def __init__(self, bigchain, name, ledgers, db=None):
        if not db:
            db = DB
        self.bigchain = bigchain
        self.db = db
        self.name = name
        self.sk, self.vk = bigchaindb.crypto.generate_key_pair()
        self.ledgers = ledgers
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
                           .filter(lambda user: user['name'] == self.name)
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
            'vk': self.vk
        }


def retrieve_accounts(bigchain, db=None):
    if not db:
        db = DB
    return list(r.db(db)
                .table('accounts')
                .run(bigchain.conn))
