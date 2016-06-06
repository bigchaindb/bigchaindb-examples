from tornado import websocket, web, ioloop
from tornado.gen import coroutine

import rethinkdb as r

from init_db import get_bigchain

clients = []
bigchain = get_bigchain()

# from http://blog.hiphipjorge.com/django-and-realtime-using-django-with-tornado-and-rethinkdb/
r.set_loop_type("tornado")


@coroutine
def print_changes():
    conn = yield bigchain.conn
    feed = yield r.table('backlog').changes().run(conn)
    while (yield feed.fetch_next()):
        change = yield feed.next()
        tx = None
        if change['old_val']:
            tx = change['old_val']['transaction']
        elif change['new_val']:
            tx = change['new_val']['transaction']
        for client in clients:
            if tx:
                msg_sent = False
                for condition in tx['conditions']:
                    if client.username in condition['new_owners']:
                        client.write_message(change)
                        msg_sent = True
                        break
                if msg_sent:
                    continue
                for fullfillment in tx['fulfillments']:
                    if client.username in fullfillment['current_owners']:
                        client.write_message(change)
                        break


class ChangeFeedWebSocket(websocket.WebSocketHandler):
    username = None

    def check_origin(self, origin):
        return True

    def open(self, username):
        # self.stream.set_nodelay(True)
        if self not in clients:
            self.username = username
            clients.append(self)
        print('ws: open (Pool: {} connections)'.format(len(clients)))

    def on_message(self, message):
        self.write_message(u"You said: " + message)

    def on_close(self):
        for i, client in enumerate(clients):
            if client is self:
                del clients[i]
                print('ws: close (Pool: {} connections)'.format(len(clients)))
                return


app = web.Application([
    (r'/users/(.*)/changes', ChangeFeedWebSocket)
])

if __name__ == '__main__':
    app.listen(8888)
    ioloop.IOLoop.current().add_callback(print_changes)
    ioloop.IOLoop.instance().start()
