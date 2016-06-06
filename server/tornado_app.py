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
        for client in clients:
            client.write_message(change)


class ChangeFeedWebSocket(websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self):
        # self.stream.set_nodelay(True)
        if self not in clients:
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
    (r'/changes', ChangeFeedWebSocket)
])

if __name__ == '__main__':
    app.listen(8888)
    ioloop.IOLoop.current().add_callback(print_changes)
    ioloop.IOLoop.instance().start()
