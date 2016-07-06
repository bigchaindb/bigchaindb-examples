import uuid
from copy import deepcopy

import rethinkdb as r
from bigchaindb import Bigchain


def mint_coin(user_pk):
    b = Bigchain()
    coin_id = uuid.uuid4()

    for i in range(10):
        payload = {
            'coin_id': str(coin_id),
            'coin_share': str(i)
        }
        tx = b.create_transaction(b.me, user_pk, None, 'CREATE', payload=payload)
        tx_signed = b.sign_transaction(tx, b.me_private)
        b.write_transaction(tx_signed)
        print('MINT {} {} {}'.format(tx['id'], coin_id, i))


def transfer_coin(user_vk, user_sk, coin_id):
    b = Bigchain()
    coins = get_owned_coins(user_vk)

    if coin_id in coins.keys():
        for tx in coins[coin_id]:
            tx_input = {'txid': tx['id'], 'cid': 0}
            tx_transfer = b.create_transaction(user_vk, b.me, tx_input, 'TRANSFER')
            tx_transfer_signed = b.sign_transaction(tx_transfer, user_sk)
            b.write_transaction(tx_transfer_signed)
            print('TRANSFER {} {} {}'.format(tx_transfer_signed['id'],
                                             coin_id, tx['transaction']['data']['payload']['coin_share']))

def get_owned_coins(user_vk):
    b = Bigchain()

    # get the coins
    coins = r.table('bigchain')\
             .concat_map(lambda doc: doc['block']['transactions'])\
             .filter(lambda tx: tx['transaction']['conditions']\
             .contains(lambda c: c['new_owners'].contains(user_vk)))\
             .group(r.row['transaction']['data']['payload']['coin_id']).run(b.conn)

    # make sure the coin was not already spent
    tmp_coins = deepcopy(coins)
    for coin_id, txs in tmp_coins.items():
        tx_input = {'txid': txs[0]['id'], 'cid': 0}
        if b.get_spent(tx_input):
            del coins[coin_id]

    return coins





