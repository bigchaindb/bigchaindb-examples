import os
import re
import argparse
import logging
import subprocess

import rethinkdb as r
from bigchaindb import Bigchain

from init_db import main as init_db_main

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


def run_init_bigchaindb(args):
    # initialize the databases for ledger args.ledger
    my_env = os.environ.copy()
    bigchaindb_db_name = 'bigchaindb_examples{}'.format(args.ledger)
    my_env['BIGCHAINDB_DATABASE_NAME'] = bigchaindb_db_name
    subprocess.Popen(['bigchaindb', '-c', '.bigchaindb_examples', 'init'], env=my_env).wait()
    # subprocess.Popen(['python3', 'init_db.py', str(args.ledger)], env=my_env).wait()


def run_reset_bigchaindb(args):
    # delete databases for ledger args.ledger or all
    b = Bigchain()

    # dbs do delete
    dbnames = []
    if args.ledger:
        dbnames = ['bigchaindb_examples{}'.format(args.ledger)]
    elif args.all:
        regex_db = re.compile(r'^(bigchaindb_examples\d*$)')
        for dbname in r.db_list().run(b.conn):
            if regex_db.match(dbname):
                dbnames.append(dbname)

    delete_databases(dbnames)


def run_init_accounts(args):
    init_db_main()


def run_reset_accounts(args):
    delete_databases(['interledger', 'ontherecord', 'sharetrader'])


def run_start(args):
    # setup env
    frontend_port = 3000 + args.ledger
    flask_port = 8000 + args.ledger
    tornado_port = 8888 + args.ledger
    bigchaindb_db_name = 'bigchaindb_examples{}'.format(args.ledger)
    bigchaindb_server_bind = 'localhost:{}'.format(9984 + args.ledger)

    my_env = os.environ.copy()
    my_env['CLIENT_PORT'] = str(frontend_port)
    my_env['FLASK_PORT'] = str(flask_port)
    my_env['TORNADO_PORT'] = str(tornado_port)
    my_env['BIGCHAINDB_DATABASE_NAME'] = bigchaindb_db_name
    my_env['BIGCHAINDB_SERVER_BIND'] = bigchaindb_server_bind
    my_env['BIGCHAINDB_LEDGER_NUMBER'] = str(args.ledger)

    # we need to make sure that the database is initialized before calling anything else
    # initialize bigchaindb database
    subprocess.Popen(['bigchaindb', '-c', '.bigchaindb_examples', 'init'], env=my_env).wait()
    # initialize apps database
    subprocess.Popen(['python3', 'init_db.py', str(args.ledger)], env=my_env).wait()
    # main_init_db(args.ledger)

    # start npm
    p_npm = subprocess.Popen(['/bin/sh', 'start.sh'], cwd='./client/', env=my_env)

    # start flask
    p_flask = subprocess.Popen(['python', '-m', 'server.app'], env=my_env)

    # start tornado
    p_tornado = subprocess.Popen(['python', '-m', 'server.tornado_app'], env=my_env)

    # start bigchaindb
    p_bigchaindb = subprocess.Popen(['bigchaindb', '-c', '.bigchaindb_examples', 'start'], env=my_env)

    # wait for processes to finish
    p_npm.wait()
    p_flask.wait()
    p_tornado.wait()
    p_bigchaindb.wait()


def main():
    parser = argparse.ArgumentParser(prog='bigchaindb-examples',
                                     description='Run bigchaindb examples')

    subparser = parser.add_subparsers(title='Commands',
                                      dest='command')

    start_parser = subparser.add_parser('start',
                                        help='start a new ledger')

    start_parser.add_argument('-l', '--ledger',
                              type=int,
                              default=0,
                              help='Start a new ledger with the number provided')

    init_parser = subparser.add_parser('init-bigchaindb',
                                       help='Initialize a new bigchaindb ledger')

    init_parser.add_argument('ledger',
                             metavar='N',
                             type=int,
                             help='Initialize the databases for a ledger N')

    subparser.add_parser('init-accounts',
                         help='Initialize accounts for all the apps')

    reset_bigchaindb_parser = subparser.add_parser('reset-bigchaindb',
                                                   help='Delete the bigchaindb ledger')
    reset_bigchaindb_parser.add_argument('-l', '--ledger',
                                         type=int,
                                         help='Delete the bigchaindb ledger with the number provided')
    reset_bigchaindb_parser.add_argument('-a', '--all',
                                         default=False,
                                         action='store_true',
                                         help='Delete all the bigchaindb ledgers')

    reset_accounts_parser = subparser.add_parser('reset-accounts',
                                                 help='Delete the accounts databases')

    start(parser, globals())


if __name__ == '__main__':
    main()
