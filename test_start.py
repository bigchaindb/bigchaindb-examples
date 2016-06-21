import os
import sys
import subprocess


def main(port_offset):

    # setup env
    frontend_port = 3000 + int(port_offset)
    flask_port = 8000 + int(port_offset)
    tornado_port = 8888 + int(port_offset)

    my_env = os.environ.copy()
    my_env['CLIENT_PORT'] = str(frontend_port)
    my_env['FLASK_PORT'] = str(flask_port)
    my_env['TORNADO_PORT'] = str(tornado_port)

    # start npm
    p_npm = subprocess.Popen(['/bin/sh', 'start.sh'], cwd='./client/', env=my_env)

    # start flask
    p_flask = subprocess.Popen(['python', '-m', 'server.app'], env=my_env)

    # start tornado
    p_tornado = subprocess.Popen(['python', '-m', 'server.tornado_app'], env=my_env)

    # start bigchaindb
    # p_bigchaindb = subprocess.Popen(['bigchaindb', '-c', '.bigchaindb_examples', 'start'])

    # wait for processes to finish
    p_npm.wait()
    p_flask.wait()
    p_tornado.wait()
    # p_bigchaindb.wait()


if __name__ == '__main__':
    main(sys.argv[1])
