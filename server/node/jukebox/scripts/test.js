'use strict'

const co = require('co')
const ILP = require('ilp')
const { Client } = require('ilp-core');
const FiveBellsLedgerPlugin = require('ilp-plugin-bells')
const bdbPlugin = require('ilp-plugin-bigchaindb');


const sender = ILP.createSender({
  _plugin: FiveBellsLedgerPlugin,
  prefix: '3001.',
  account: 'http://localhost:3001/accounts/alice',
  password: 'alice'
})

const receiver = ILP.createReceiver({
  _plugin: FiveBellsLedgerPlugin,
  prefix: '3002.',
  account: 'http://localhost:3002/accounts/bob',
  password: 'bobbob'
})

// const bdb = new Client({
//     _plugin: bdbPlugin,
//     prefix: '8000.',
//     auth: {
//         account: {
//             id: 'CYg8FutgXTzzam9ypTxFiUn8X6wdJKoLqRWgdPtQkQN4',
//             key: '7XzANuRzzb8kQouX1WVQyxjbJC7BTitAYkrQHZhnzjTq',
//             uri: {
//                 api: 'http://localhost:8000',
//                 ws: 'ws://localhost:8888'
//             }
//         },
//         ledgerId: '8000'
//     }
// });


const bdb = ILP.createReceiver({
    _plugin: bdbPlugin,
    prefix: '8000.',
    auth: {
        account: {
            id: 'CYg8FutgXTzzam9ypTxFiUn8X6wdJKoLqRWgdPtQkQN4',
            key: '7XzANuRzzb8kQouX1WVQyxjbJC7BTitAYkrQHZhnzjTq',
            uri: {
                api: 'http://localhost:8000',
                ws: 'ws://localhost:8888'
            }
        },
        ledgerId: '8000'
    }
});



// bdb.getBalance().then((res) => {
//     console.log(res);
// })
// .catch((err) => {
//     console.log(err);
// });

// bdb.connect();

co(function * () {
  yield receiver.listen()
  receiver.on('incoming', (transfer, fulfillment) => {
    console.log('received transfer:', transfer)
    console.log('fulfilled transfer hold with fulfillment:', fulfillment)
  })

  const request = receiver.createRequest({
    amount: '10',
  })
  console.log('request:', request)

  const paymentParams = yield sender.quoteRequest(request)
  console.log('paymentParams', paymentParams)

  const result = yield sender.payRequest(paymentParams)
  console.log('sender result:', result)
}).catch((err) => {
  console.log(err)
})
