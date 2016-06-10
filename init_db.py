import random
import logging
import os.path

import bigchaindb
import bigchaindb.config_utils

from server.lib.models.accounts import Account
from server.lib.models.assets import create_asset

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    CONFIG_FILE = os.environ['BIGCHAINDB_CONFIG']
except KeyError:
    CONFIG_FILE = os.path.join(os.path.dirname(__file__), '.bigchaindb_examples')

APPS = [
    {
        'name': 'ontherecord',
        'num_accounts': 3,
        'num_assets': 0,
        'payload_func': (
            lambda x: {
                'app': 'ontherecord',
                'content': x
            }
        )
    },
    {
        'name': 'sharetrader',
        'num_accounts': 5,
        'num_assets': 64,
        'payload_func': (
            lambda i: {
                'app': 'sharetrader',
                'content': {
                    'x': int(i / 8),
                    'y': int(i % 8)
                }
            }
        )
    },
    {
        'name': 'interledger',
        'num_accounts': 3,
        'num_assets': 9,
        'payload_func': (
            lambda x: {
                'app': 'interledger',
                'content': x
            }
        )
    }
]


def get_bigchain(conf=CONFIG_FILE):
    if os.path.isfile(conf):
        bigchaindb.config_utils.autoconfigure(filename=conf, force=True)

    return bigchaindb.Bigchain()

bigchain = get_bigchain()
logging.info('INIT: bigchain initialized with database: {}'.format(bigchaindb.config['database']['name']))


def main():

    for app in APPS:
        accounts = []
        for i in range(app['num_accounts']):
            account = Account(bigchain=bigchain,
                              name='account_{}'.format(i),
                              db=app['name'])
            accounts.append(account)

        logging.info('INIT: {} accounts initialized for app: {}'.format(len(accounts), app['name']))

        assets = []
        for i in range(app['num_assets']):
            asset = create_asset(bigchain=bigchain,
                                 to=accounts[random.randint(0, app['num_accounts'] - 1)].vk,
                                 payload=app['payload_func'](i))
            assets.append(asset)
        logging.info('INIT: {} assets initialized for app: {}'.format(len(assets), app['name']))


if __name__ == '__main__':
    main()
