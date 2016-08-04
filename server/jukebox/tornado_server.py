from bigchaindb import Bigchain
from bigchaindb import crypto
from tornado import websocket, ioloop, web
from tornado.gen import coroutine
from tornado import gen
from .stream_coin import pay_royalties
import time
import json
import multiprocessing as mp

clients = []
coins_seen = []
play_until = time.time()
label_sk, label_vk = crypto.generate_key_pair()
artist_sk, artist_vk = crypto.generate_key_pair()
artist_share = 0
label_share = 0
royalties_queue = mp.Queue()
me = Bigchain().me


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


def get_coin_shares_from_block(block):
    for tx in block['block']['transactions']:
        new_owners = tx['transaction']['conditions'][0]['new_owners']
        if new_owners == [me]:
            royalties_queue.put(tx)
            print('ROYALTIES {}'.format(tx['id']))


def update_shares(block):
    global artist_share
    global label_share
    for tx in block['block']['transactions']:
        coin_id = tx['transaction']['data']['payload']['coin_id']
        new_owners = tx['transaction']['conditions'][0]['new_owners']
        if new_owners == [artist_vk]:
            artist_share += 0.1
        elif new_owners == [label_vk]:
            label_share += 0.1


def test_mp():
    import rethinkdb as r
    while True:
        tx = royalties_queue.get()
        pay_royalties(label_vk, artist_vk, tx)
        

@coroutine
def play():
    print('Entering Play')
    playing = False
    global artist_share
    global label_share
    while True:
        if play_until > time.time():
            playing = True
            for cl in clients:
                cl.write_message(json.dumps({'playing': playing,
                                             'duration': int(play_until - time.time()),
                                             'artist_share': '{0:0.1f}'.format(artist_share),
                                             'label_share': '{0:0.1f}'.format(label_share),
                                            }))
                print(playing)
                print(artist_share, label_share)
        elif play_until < time.time() and playing is True:
            playing = False
            cl.write_message(json.dumps({'playing': playing}))
            print(playing)
        yield gen.sleep(1)


@coroutine
def listen_payments():
    import rethinkdb as r
    r.set_loop_type('tornado')
    print('Entering listen_payments')
    global play_until
    b = Bigchain()
    conn = yield b.conn
    feed = yield r.table('bigchain').changes().run(conn)

    while (yield feed.fetch_next()):
        block = yield feed.next()
        if not block['old_val']:
            coins = get_coin_from_block(block['new_val'])
            update_shares(block['new_val'])
            if coins:
                print('received coins')
            if time.time() > play_until:
                play_until = time.time() + 10 * len(coins)
            else:
                play_until += 10 * len(coins)
        else:
            get_coin_shares_from_block(block['new_val'])


app = web.Application([
    (r'/ws', StreamHandler),
])

if __name__ == '__main__':
    app.listen(8888)
    print('Starting tornado')
    print(play_until)
    ioloop.IOLoop.current().add_callback(play)
    ioloop.IOLoop.current().add_callback(listen_payments)

    # bigchaindb does not support async calls with tornado that is why we need to call this code
    # inside a separate process
    mp.Process(target=test_mp).start()
    ioloop.IOLoop.instance().start()
