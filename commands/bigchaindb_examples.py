import os
import re
import argparse
import logging
import subprocess

import rethinkdb as r
from bigchaindb import Bigchain

from init_db import main as main_init_db

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


def run_reset(args):
    b = Bigchain()
    regex_db = re.compile(r'^((bigchaindb_examples\d*$)|(interledger\d*$)|(ontherecord\d*$)|(sharetrader\d*$))')

    for dbname in r.db_list().run(b.conn):
        if regex_db.match(dbname):
            logger.info('Droping database: {}'.format(dbname))
            r.db_drop(dbname).run(b.conn)


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

    subparser.add_parser('reset',
                         help='Reset the database')

    start_parser = subparser.add_parser('start',
                                        help='start a new ledger')

    start_parser.add_argument('-l', '--ledger',
                              type=int,
                              default=0,
                              help='Start a new ledger with the number provided')

    start(parser, globals())


if __name__ == '__main__':
    main()
