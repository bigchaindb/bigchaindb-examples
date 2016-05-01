import bigchaindb

from server.lib.models.accounts import Account

app_name = 'on_the_record'
bigchain = bigchaindb.Bigchain()


def main():
    capacity = 5
    accounts = []
    for i in range(2 * capacity):
        account = Account(bigchain=bigchain,
                          name='account_{}'.format(i))
        accounts.append(account)
    print('INIT: {} accounts initialized'.format(len(accounts)))

if __name__ == '__main__':
    main()