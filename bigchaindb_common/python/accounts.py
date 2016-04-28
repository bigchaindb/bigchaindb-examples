import rethinkdb as r

import bigchaindb.crypto
from .assets import transfer_asset


class Account:
    def __init__(self, app_name, bigchain, name):
        self.app_name = app_name
        self.bigchain = bigchain
        self.name = name
        self.sk, self.vk = bigchaindb.crypto.generate_key_pair()
        self.save()

    @property
    def tokens(self):
        return self.bigchain.get_owned_ids(self.vk)

    def transfer(self, to, token):
        return transfer_asset(bigchain=self.bigchain,
                              source=self.vk,
                              to=to,
                              token=token,
                              sk=self.sk)

    def save(self):
        try:
            r.db_create(self.app_name).run(self.bigchain.conn)
        except r.ReqlOpFailedError:
            pass

        try:
            r.db(self.app_name).table_create('accounts').run(self.bigchain.conn)
        except r.ReqlOpFailedError:
            pass

        user_exists = list(r.db(self.app_name)
                           .table('accounts')
                           .filter(lambda user: user['name'] == self.name)
                           .run(self.bigchain.conn))

        if not len(user_exists):
            r.db(self.app_name)\
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


def retrieve_accounts(app_name, bigchain):
    return list(r.db(app_name)
                .table('accounts')
                .run(bigchain.conn))
