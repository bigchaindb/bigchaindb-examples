from tornado import websocket, ioloop, web

clients = []

class StreamHandler(websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self):
        if self not in cl:
            clients.append(self)
            self.write_message('Hello')
            print('Received connection from {}'.format(self))

    def on_close(self):
        if self in clients:
            clients.remove(self)
            print('Connection closed for {}'.format(self))

app = web.Application([
    (r'/ws', StreamHandler),
])

if __name__ == '__main__':
    app.listen(8888)
    print('Starting tornado')
    ioloop.IOLoop.instance().start()
