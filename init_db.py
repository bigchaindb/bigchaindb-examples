import random

import bigchaindb

from server.lib.models.accounts import Account
from server.lib.models.assets import create_asset

bigchain = bigchaindb.Bigchain()

APPS = [
    {
        'name': 'ontherecord',
        'num_accounts': 10,
        'num_assets': 0,
        'payload_func': (
            lambda x: {
                'app': 'ontherecord',
                'content': x
            }
        )
    },
    {
        'name': 'sharetrade',
        'num_accounts': 10,
        'num_assets': 64,
        'payload_func': (
            lambda i: {
                'app': 'sharetrade',
                'content': {
                    'x': int(i / 8),
                    'y': int(i % 8)
                }
            }
        )
    }
]


def main():

    for app in APPS:
        accounts = []
        for i in range(app['num_accounts']):
            account = Account(bigchain=bigchain,
                              name='account_{}'.format(i),
                              db=app['name'])
            accounts.append(account)

        print('INIT: {} accounts initialized for app: {}'.format(len(accounts), app['name']))

        assets = []
        for i in range(app['num_assets']):
            asset = create_asset(bigchain=bigchain,
                                 to=accounts[random.randint(0, app['num_accounts'] - 1)].vk,
                                 payload=app['payload_func'](i))
            assets.append(asset)
        print('INIT: {} assets initialized for app: {}'.format(len(assets), app['name']))


if __name__ == '__main__':
    main()
