import os
import os.path

import bigchaindb
import bigchaindb.config_utils

try:
    CONFIG_FILE = os.environ['BIGCHAINDB_CONFIG']
except KeyError:
    CONFIG_FILE = os.path.join(os.path.dirname(__file__), '.bigchaindb_examples')


def get_bigchain(conf=CONFIG_FILE, ledger_id=None):
    print('config file is {}'.format(conf))
    # import ipdb; ipdb.set_trace()
    if os.path.isfile(conf):
        print('do autoconfig')
        bigchaindb.config_utils.autoconfigure(filename=conf, force=True)

    if ledger_id is not None:
        return bigchaindb.Bigchain(dbname='bigchaindb_examples_{}'.format(ledger_id))
    else:
        return bigchaindb.Bigchain()
