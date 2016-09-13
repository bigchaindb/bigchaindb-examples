import subprocess
import os

def run_tornado():
    return subprocess.Popen(['python', '-m', 'server.tornado_server'])


def run_http_server():
    os.chdir('public/')
    return subprocess.Popen(['python', '-m', 'http.server'])


def run_bigchaindb():
    return subprocess.Popen(['bigchaindb', 'start'])


def start_all():
    procs = []
    procs += [run_tornado()]
    procs += [run_bigchaindb()]
    procs += [run_http_server()]

    for proc in procs:
        proc.wait()


if __name__ == '__main__':
    start_all()
