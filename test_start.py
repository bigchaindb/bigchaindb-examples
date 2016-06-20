import subprocess

p_npm = subprocess.Popen(['/bin/sh', 'start.sh'], cwd='./client/')
p_flask = subprocess.Popen(['python', '-m', 'server.app'])
p_tornado = subprocess.Popen(['python', '-m', 'server.tornado_app'])
p_bigchaindb = subprocess.Popen(['bigchaindb', '-c', '.bigchaindb_examples', 'start'])
p_npm.wait()
p_flask.wait()
p_tornado.wait()
p_bigchaindb.wait()