from bigchaindb import Bigchain
from tornado import websocket, ioloop, web
from tornado.gen import coroutine
from tornado import gen
import rethinkdb as r
import time
import json

clients = []
coins_seen = []
play_until = time.time()
me = Bigchain().me
r.set_loop_type('tornado')


class StreamHandler(websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self):
        if self not in clients:
            clients.append(self)
            print('Received connection from {}'.format(self))

    def on_close(self):
        if self in clients:
            clients.remove(self)
            print('Connection closed for {}'.format(self))


def get_coin_from_block(block):
    coins = []
    for tx in block['block']['transactions']:
        coin_id = tx['transaction']['data']['payload']['coin_id']
        new_owners = tx['transaction']['conditions'][0]['new_owners']
        if coin_id not in coins_seen and new_owners == [me]:
            coins_seen.append(coin_id)
            coins.append(coin_id)
    return coins


@coroutine
def play():
    print('Entering Play')
    print(play_until)
    print(coins_seen)
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
    print('Entering listen_payments')
    global play_until
    print(coins_seen)
    print(play_until)
    b = Bigchain()
    conn = yield b.conn
    feed = yield r.table('bigchain').changes().run(conn)

    while (yield feed.fetch_next()):
        block = yield feed.next()
        coins = get_coin_from_block(block['new_val'])
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
    print(play_until)
    ioloop.IOLoop.current().add_callback(play)
    ioloop.IOLoop.current().add_callback(listen_payments)
    ioloop.IOLoop.instance().start()
