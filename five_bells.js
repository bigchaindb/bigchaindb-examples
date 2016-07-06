import { Client } from 'ilp-core'

const client = new Client({
  type: 'bells',
  auth: {
    account: 'https://red.ilpdemo.org/ledger/accounts/alice',
    password: 'alice'
  }
})


const payment = {
  destinationAccount: 'https://blue.ilpdemo.org/ledger/accounts/bob',
  destinationLedger: 'https://blue.ilpdemo.org/ledger',
  destinationAmount: '1',
  destinationMemo: {
    myKey: 'myValue'
  },
  executionCondition: 'cc:0:3:47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU:0',
  expiresAt: (new Date(Date.now() + 4000)).toISOString()
}

client.quote({
  destinationLedger: payment.destinationLedger,
  destinationAmount: payment.destinationAmount
})
.then((quote) => {
  return client.sendQuotedPayment(Object.assign({}, payment, quote))
})
.then(() => {
  console.log('payment sent')
})
.catch((err) => {
  console.log(err)
})

client.on('fulfill_execution_condition', (transfer, fulfillment) => {
  console.log('transfer fulfilled', fulfillment)
  client.disconnect()
})