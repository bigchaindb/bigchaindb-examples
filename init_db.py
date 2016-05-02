import bigchaindb

from server.lib.models.accounts import Account

bigchain = bigchaindb.Bigchain()

APPS = ['ontherecord', 'sharetrade']


def main():
    capacity = 5

    for app in APPS:
        accounts = []
        for i in range(2 * capacity):
            account = Account(bigchain=bigchain,
                              name='account_{}'.format(i),
                              db=app)
            accounts.append(account)

        print('INIT: {} accounts initialized for app: {}'.format(len(accounts), app))

if __name__ == '__main__':
    main()
