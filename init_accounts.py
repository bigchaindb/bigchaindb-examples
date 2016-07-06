import logging
import os
import os.path

import bigchaindb
import bigchaindb.config_utils

import apps_config
from server.lib.models.accounts import Account

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    CONFIG_FILE = os.environ['BIGCHAINDB_CONFIG']
except KeyError:
    CONFIG_FILE = os.path.join(os.path.dirname(__file__), '.bigchaindb_examples')

APPS = apps_config.APPS


LEDGER_API_BASE_HOST = os.environ.get('DOCKER_MACHINE_IP') or 'localhost'
LEDGER_API_BASE_PORT = int(os.environ.get('LEDGER_API_BASE_PORT', '8000'))
LEDGER_WS_BASE_HOST = os.environ.get('DOCKER_MACHINE_IP') or 'localhost'
LEDGER_WS_BASE_PORT = int(os.environ.get('LEDGER_WS_BASE_PORT', '8888'))


def get_bigchain(conf=CONFIG_FILE, ledger_id=None):
    if os.path.isfile(conf):
        bigchaindb.config_utils.autoconfigure(filename=conf, force=True)

    if ledger_id is not None:
        return bigchaindb.Bigchain(dbname='bigchaindb_examples_{}'.format(ledger_id))
    else:
        return bigchaindb.Bigchain()

bigchain = get_bigchain()
logging.info('INIT: bigchain initialized with database: {}'.format(bigchaindb.config['database']['name']))


def creat_uri(host, port, offset):
    return '{}:{}'.format(host, port+offset)


def main():

    for app in APPS:
        accounts = []
        app_name = '{}'.format(app['name'])
        if 'num_accounts' in app:
            for i in range(app['num_accounts']):
                account = Account(bigchain=bigchain,
                                  name='account_{}'.format(i),
                                  ledger={
                                      'id': app['ledger'],
                                      'api': creat_uri(LEDGER_API_BASE_HOST,
                                                       LEDGER_API_BASE_PORT,
                                                       app['ledger']),
                                      'ws': creat_uri(LEDGER_WS_BASE_HOST,
                                                      LEDGER_WS_BASE_PORT,
                                                      app['ledger'])
                                  },
                                  db=app_name)
                accounts.append(account)
        elif 'accounts' in app:
            for account_config in app['accounts']:
                for ledger in account_config['ledgers']:
                    account = Account(bigchain=bigchain,
                                      name=account_config['name'],
                                      ledger={
                                          'id': ledger['id'],
                                          'api': creat_uri(
                                              LEDGER_API_BASE_HOST,
                                              LEDGER_API_BASE_PORT,
                                              ledger['id']
                                          ),
                                          'ws': creat_uri(
                                              LEDGER_WS_BASE_HOST,
                                              LEDGER_WS_BASE_PORT,
                                              ledger['id']
                                          )
                                      },
                                      db=app_name)
                    accounts.append(account)
        logging.info('INIT: {} accounts initialized for app: {}'.format(len(accounts), app_name))


if __name__ == '__main__':
    main()
