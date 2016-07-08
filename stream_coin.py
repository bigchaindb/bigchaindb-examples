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
            tx_transfer = b.create_transaction(user_vk, b.me, tx_input, 'TRANSFER',
                                               payload=tx['transaction']['data']['payload'])
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


def get_owned_coin_shares_by_id(user_vk, coin_id):
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
        for tx in txs:
            tx_input = {'txid': txs[0]['id'], 'cid': 0}
            if b.get_spent(tx_input):
                coins[coin_id].remove(tx)
    return coins.get(coin_id, [])


def pay_royalties(label_vk, artist_vk, coin_id, label_share=7, artist_share=3):
    b = Bigchain()
    coin_txs = get_owned_coin_shares_by_id(b.me, coin_id)

    for tx in coin_txs:
        payload = tx['transaction']['data']['payload']
        tx_input = {'txid': tx['id'], 'cid': 0}
        if int(payload['coin_share']) < artist_share:
            new_owner = artist_vk
        else:
            new_owner = label_vk

        tx_royalties = b.create_transaction(b.me, new_owner, tx_input, 'TRANSFER', payload=payload)
        tx_royalties_signed = b.sign_transaction(tx_royalties, b.me_private)
        b.write_transaction(tx_royalties_signed)
        print('ROYALTIES {} {} {} {}'.format(tx_royalties['id'], payload['coin_id'],
                                            payload['coin_share'], new_owner))

