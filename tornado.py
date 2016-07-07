from bigchaindb import Bigchain
from tornado import websocket, ioloop, web
from tornado.gen import coroutine
import rethinkdb as r
import time
import json

clients = []
coins_seen = []
play_until = time.time()


class StreamHandler(websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self):
        if self not in clients:
            clients.append(self)
            self.write_message('Hello')
            print('Received connection from {}'.format(self))

    def on_close(self):
        if self in clients:
            clients.remove(self)
            print('Connection closed for {}'.format(self))


def get_coin_from_block(block):
    coins = []
    for tx in block['block']['transactions']:
        coin_id = tx['transaction']['data']['payload']['coin_id']
        if coin_id not in coins_seen:
            coins_seen.append(coin_id)
            coins.append(coin_id)
    return coins


@coroutine
def play():
    playing = False
    while True:
        if play_until > time.time() and playing is False:
            playing = True
            for cl in clients:
                cl.write_message(json.dumps({'playing': playing}))
                print(playing)
        elif play_until < time.time() and playing is True:
            playing = False
            cl.write_message(json.dumps({'playing': playing}))
            print(playing)
        yield gen.sleep(1)


@coroutine
def listen_payments():
    b = Bigchain()
    conn = b.conn
    feed = yield r.table('bigchain').changes().run(conn)

    while (yield feed.fetch_next()):
        block = feed.next()
        coins = get_coin_from_block(block)
        if coins:
            print('received coins')
        if time.time() > play_until:
            play_until = time.time() + 10 * len(coins)
        else:
            play_until += 10 * len(coins)





app = web.Application([
    (r'/ws', StreamHandler),
])

if __name__ == '__main__':
    app.listen(8888)
    print('Starting tornado')
    ioloop.IOLoop.current().add_callback(play)
    ioloop.IOLoop.current().add_callback(listen_payments)
    ioloop.IOLoop.instance().start()
