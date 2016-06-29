import os
import re
import argparse
import logging
import subprocess

import rethinkdb as r
from bigchaindb import Bigchain

from init_accounts import main as init_accounts_main
from init_assets import main as init_assets_main
from apps_config import APPS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def start(parser, scope):
    """Utility function to execute a subcommand.
    The function will look up in the ``scope``
    if there is a function called ``run_<parser.args.command>``
    and will run it using ``parser.args`` as first positional argument.
    Args:
        parser: an ArgumentParser instance.
        scope (dict): map containing (eventually) the functions to be called.
    Raises:
        NotImplementedError: if ``scope`` doesn't contain a function called
                             ``run_<parser.args.command>``.
    """
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    # look up in the current scope for a function called 'run_<command>'
    # replacing all the dashes '-' with the lowercase character '_'
    func = scope.get('run_' + args.command.replace('-', '_'))

    # if no command has been found, raise a `NotImplementedError`
    if not func:
        raise NotImplementedError('Command `{}` not yet implemented'.
                                  format(args.command))

    func(args)


def delete_databases(dbnames=[]):
    b = Bigchain()

    for dbname in dbnames:
        logger.info('Dropping database: {}'.format(dbname))
        try:
            r.db_drop(dbname).run(b.conn)
        except r.ReqlOpFailedError as e:
            logger.info(e.message)


def init_ledgers(ledger_ids=[]):
    for ledger_id in ledger_ids:
        my_env = os.environ.copy()
        bigchaindb_db_name = 'bigchaindb_examples_{}'.format(ledger_id)
        logger.info('Initializing ledger {}'.format(bigchaindb_db_name))
        my_env['BIGCHAINDB_DATABASE_NAME'] = bigchaindb_db_name
        subprocess.Popen(['bigchaindb', '-c', '.bigchaindb_examples', 'init'], env=my_env).wait()


def start_services(ledger_num):
    procs = []

    # setup env
    frontend_port = 3000 + ledger_num
    flask_port = 8000 + ledger_num
    tornado_port = 8888 + ledger_num
    bigchaindb_db_name = 'bigchaindb_examples_{}'.format(ledger_num)
    bigchaindb_server_bind = 'localhost:{}'.format(9984 + ledger_num)

    my_env = os.environ.copy()
    my_env['CLIENT_PORT'] = str(frontend_port)
    my_env['FLASK_PORT'] = str(flask_port)
    my_env['TORNADO_PORT'] = str(tornado_port)
    my_env['BIGCHAINDB_DATABASE_NAME'] = bigchaindb_db_name
    my_env['BIGCHAINDB_SERVER_BIND'] = bigchaindb_server_bind
    my_env['BIGCHAINDB_LEDGER_NUMBER'] = str(ledger_num)

    # start npm
    p_npm = subprocess.Popen(['/bin/sh', 'start.sh'], cwd='./client/', env=my_env)
    procs.append(p_npm)

    # start flask
    p_flask = subprocess.Popen(['python', '-m', 'server.app'], env=my_env)
    procs.append(p_flask)

    # start tornado
    p_tornado = subprocess.Popen(['python', '-m', 'server.tornado_app'], env=my_env)
    procs.append(p_tornado)

    # start bigchaindb
    p_bigchaindb = subprocess.Popen(['bigchaindb', '-c', '.bigchaindb_examples', 'start'], env=my_env)
    procs.append(p_bigchaindb)

    return procs


def start_connectors():
    # start connectors
    return [subprocess.Popen(['python', '-m', 'server.lib.models.connector'])]


def get_ledger_ids_from_config(config):
    # read the config file and return all ledger ids
    ledger_ids = []
    for app in config:
        if app['name'] != 'interledger':
            ledger_ids.append(app['ledger'])
        else:
            for account in app['accounts']:
                for ledger in account['ledgers']:
                    ledger_ids.append(ledger['id'])

    return list(set(ledger_ids))


def run_init_bigchaindb(args):
    # initialize the databases for ledger args.ledger
    ledger_ids = []
    if args.ledger:
        ledger_ids = [args.ledger]
    elif args.all:
        ledger_ids = get_ledger_ids_from_config(APPS)

    init_ledgers(ledger_ids)


def run_reset_bigchaindb(args):
    # delete databases for ledger args.ledger or all
    b = Bigchain()

    # dbs do delete
    dbnames = []
    if args.ledger:
        dbnames = ['bigchaindb_examples_{}'.format(args.ledger)]
    elif args.all:
        regex_db = re.compile(r'^(bigchaindb_examples_\d*$)')
        for dbname in r.db_list().run(b.conn):
            if regex_db.match(dbname):
                dbnames.append(dbname)

    delete_databases(dbnames)


def run_init_accounts(args):
    init_accounts_main()


def run_reset_accounts(args):
    delete_databases(['interledger', 'ontherecord', 'sharetrader'])


def run_init_assets(args):
    init_assets_main()


def run_start(args):
    # check if we need to initialize
    if args.init:
        init_args = argparse.Namespace()
        run_init_all(init_args)

    ledger_ids = []
    if args.ledger:
        ledger_ids = [args.ledger]
    elif args.all:
        ledger_ids = get_ledger_ids_from_config(APPS)

    procs = []
    for ledger in ledger_ids:
        procs += start_services(ledger)

    procs += start_connectors()

    # wait for processes to finish
    for proc in procs:
        proc.wait()


def run_reset_all(args):
    # reset bigchaindb
    args = argparse.Namespace(all=True, command='reset-bigchaindb', ledger=None)
    run_reset_bigchaindb(args)

    # reset accounts
    args = argparse.Namespace()
    run_reset_accounts(args)


def run_init_all(args):
    # init bigchaindb
    args = argparse.Namespace(all=True, command='init-bigchaindb', ledger=None)
    run_init_bigchaindb(args)

    # init accounts
    args = argparse.Namespace()
    run_init_accounts(args)

    # init assets
    args = argparse.Namespace()
    run_init_assets(args)


def main():
    parser = argparse.ArgumentParser(prog='bigchaindb-examples',
                                     description='Run bigchaindb examples')

    subparser = parser.add_subparsers(title='Commands',
                                      dest='command')

    # Start services
    start_parser = subparser.add_parser('start',
                                        help='start a new ledger')
    start_parser.add_argument('-l', '--ledger',
                              type=int,
                              help='Start the services for the provided ledger')
    start_parser.add_argument('-a', '--all',
                              default=False,
                              action='store_true',
                              help='Start the services for all ledgers')
    start_parser.add_argument('-i', '--init',
                              default=False,
                              action='store_true',
                              help='First initialize and then start the services for all ledgers')

    # Initialize bigchaindb
    init_bigchaindb_parser = subparser.add_parser('init-bigchaindb',
                                                  help='Initialize a new bigchaindb ledger')
    init_bigchaindb_parser.add_argument('-l', '--ledger',
                                        type=int,
                                        help='Initialize the databases for a ledger')
    init_bigchaindb_parser.add_argument('-a', '--all',
                                        default=False,
                                        action='store_true',
                                        help='Initialize all databases for the ledgers')

    # Reset bigchaindb
    reset_bigchaindb_parser = subparser.add_parser('reset-bigchaindb',
                                                   help='Delete the bigchaindb ledger')
    reset_bigchaindb_parser.add_argument('-l', '--ledger',
                                         type=int,
                                         help='Delete the bigchaindb ledger with the number provided')
    reset_bigchaindb_parser.add_argument('-a', '--all',
                                         default=False,
                                         action='store_true',
                                         help='Delete all the bigchaindb ledgers')

    # Initialize accounts
    subparser.add_parser('init-accounts',
                         help='Initialize accounts for all the apps')

    # Reset accounts
    subparser.add_parser('reset-accounts',
                         help='Delete the accounts databases')

    # Initialize assets
    subparser.add_parser('init-assets',
                         help='Initialize assets for all the apps in all the ledgers')

    # Initialize everything
    subparser.add_parser('init-all',
                         help='Initializes all the databases for apps, ledgers and assets')

    # Reset everything
    subparser.add_parser('reset-all',
                         help='Deletes all databases created by apps and all the ledgers')

    start(parser, globals())


if __name__ == '__main__':
    main()
