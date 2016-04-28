import bigchaindb.exceptions
import bigchaindb.util

from bigchaindb_common.python.accounts import Account
from bigchaindb_common.python.assets import take_at_least_seconds, create_asset, create_asset_hashlock


app_name = 'on_the_record'
bigchain = bigchaindb.Bigchain()


def main():
    organizer = Account(app_name=app_name, bigchain=bigchain, name='organizer')
    capacity = 10
    payload = {
        'event': 'Hello BigchainDB!'
    }

    tokens = [create_asset(bigchain=bigchain,
                           to=organizer.vk,
                           payload=payload)
              for i in range(capacity)]
    print('CREATE: {} tokens created'.format(len(tokens)))

    with take_at_least_seconds(8):
        customers = [Account(app_name=app_name,
                             bigchain=bigchain,
                             name='customer_{}'.format(i))
                     for i in range(2 * capacity)]
        print('INIT: {} customers initialized'.format(len(customers)))

    vouchers = [create_asset_hashlock(bigchain=bigchain,
                                      payload=payload,
                                      secret="secret_{}".format(i))
                for i in range(capacity)]

    print('CREATE: {} vouchers created'.format(len(vouchers)))

    tokens = organizer.tokens
    print('RETRIEVE: {} tokens retrieved'.format(len(tokens)))

    transfers = [organizer.transfer(customers[i].vk, token) for i, token in enumerate(tokens)]
    print('TRANSFER: {} tokens transfered'.format(len(transfers)))

    # The following invalidates the entire block, need to wait 6 seconds
    # organizer.transfer(customers[0].vk, tokens[2])

    with take_at_least_seconds(8):
        pass

    # Throws doublespend
    try:
        organizer.transfer(customers[0].vk, tokens[-1])
    except bigchaindb.exceptions.DoubleSpend as e:
        print(e)

    num_tokens_per_customer = [len(c.tokens) for c in customers]
    for customer in customers:
        print('{}: {}: {}'.format(customer.name, customer.vk, len(customer.tokens)))
    print('RETRIEVE: {} transfers retrieved'.format(sum(num_tokens_per_customer)))


if __name__ == '__main__':
    main()
