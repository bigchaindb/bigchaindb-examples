import functools
import os
import logging

from tornado import websocket, web, ioloop
from tornado.gen import coroutine

import rethinkdb as r

from init_db import get_bigchain

clients = []
bigchain = get_bigchain()

# from http://blog.hiphipjorge.com/django-and-realtime-using-django-with-tornado-and-rethinkdb/
r.set_loop_type('tornado')


logger = logging.getLogger('tornado')


@coroutine
def print_changes(db_table):
    conn = yield bigchain.conn
    feed = yield r.table(db_table).changes().run(conn)
    while (yield feed.fetch_next()):
        change = yield feed.next()
        block = get_block_from_change(change, db_table)
        for client in clients:
            for tx in block:
                # TODO: use REQL for filtering
                if tx_contains_vk(tx['transaction'], client.username):
                    msg = {'change': change,
                           'client': client.username}
                    client.write_message(msg)
                    break


def get_block_from_change(change, db_table):
    block = []
    if db_table in ['backlog', 'bigchain'] and (change['old_val'] or change['new_val']):
        block_data = change['old_val'] if change['old_val'] else change['new_val']
        if db_table == 'bigchain':
            block = block_data['block']['transactions']
        else:
            block.append(block_data)
    return block


def tx_contains_vk(tx, vk):
    for condition in tx['conditions']:
        if vk in condition['new_owners']:
            return True
    for fullfillment in tx['fulfillments']:
        if vk in fullfillment['current_owners']:
            return True


class ChangeFeedWebSocket(websocket.WebSocketHandler):
    username = None

    def check_origin(self, origin):
        return True

    def open(self, username):
        if self not in clients:
            self.username = username
            clients.append(self)
        print('ws: open (Pool: {} connections)'.format(len(clients)))

    def on_message(self, message):
        pass

    def on_close(self):
        for i, client in enumerate(clients):
            if client is self:
                clients.remove(self)
                print('ws: close (Pool: {} connections)'.format(len(clients)))
                return

# TODO: use split changefeed for backlog and bigchain
app = web.Application([
    (r'/users/(.*)/changes', ChangeFeedWebSocket)
])


def run_tornado_server():
    tornado_port = int(os.environ.get('TORNADO_PORT', 8888))
    tornado_address = os.environ.get('TORNADO_HOST', '127.0.0.1')
    app.listen(tornado_port, address=tornado_address)
    # TODO: use split changefeed for backlog and bigchain
    ioloop.IOLoop.current().add_callback(functools.partial(print_changes, 'backlog'))
    ioloop.IOLoop.current().add_callback(functools.partial(print_changes, 'bigchain'))

    logger.info('Running on http://{}:{}'.format(tornado_address, tornado_port))
    ioloop.IOLoop.instance().start()

if __name__ == '__main__':
    run_tornado_server()
