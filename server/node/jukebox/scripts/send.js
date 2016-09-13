import { Client } from 'ilp-core';

const sendingLedger = 'http://localhost:3002';
const sendingAccount = `${sendingLedger}/accounts/alice`;
const sendingPassword = 'alice';

const receivingLedger = 'http://localhost:3003';
const receivingAccount = `${receivingLedger}/accounts/bob`;
const receivingPassword = 'bob';

const payment = {
    destinationAccount: receivingAccount,
    destinationLedger: receivingLedger,
    destinationAmount: '1',
    destinationMemo: {
        myKey: 'myValue'
    },
    executionCondition: 'cc:0:3:47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU:0',
    expiresAt: (new Date(Date.now() + 100000)).toISOString()
};


const receiver = new Client({
    type: 'bells',
    auth: {
        account: receivingAccount,
        password: receivingPassword
    }
});

const sender = new Client({
    type: 'bells',
    auth: {
        account: sendingAccount,
        password: sendingPassword
    }
});

const bdb = new Client({
    type: 'bigchaindb',
    auth: {
        account: {
            id: 'EauDkGwEyZ2YjzjVMdfS5AFcFAcQoT89CVjxQUXdRTeY',
            key: '6nGH7ZuWmyAKnjVNE77KyjJS6sRJ11Z8tiYQ6TztGUHy',
            uri: {
                api: 'http://localhost:8000',
                ws: 'ws://localhost:8888'
            }
        }
    }
});

bdb.getPlugin().getBalance().then((res) => {
    console.log(res);
})
.catch((err) => {
    console.log(err);
});

sender.waitForConnection().then(() => {
    sender.getPlugin().getBalance().then((res) => {
        console.log(`Balance sender: ${res}`);
    })
    .catch((err) => {
        console.log(err);
    });

    sender.quote({
        destinationLedger: payment.destinationLedger,
        destinationAmount: payment.destinationAmount
    })
        .then((quote) => {
            return sender.sendQuotedPayment(Object.assign({}, payment, quote));
        })
        .then(() => {
            console.log('payment sent');
        })
        .catch((err) => {
            console.log(err);
        });

    sender.on('fulfill_execution_condition', (transfer, fulfillment) => {
        console.log('transfer fulfilled', fulfillment);
        sender.getPlugin().getBalance().then((res) => {
            console.log(`Balance sender: ${res}`);
        })
        .catch((err) => {
            console.log(err);
        });
        sender.disconnect();
    });
});

receiver.on('receive', (transfer) => {
    console.log(transfer);
    receiver.fulfillCondition(transfer.id, 'cf:0:');
    console.log(receiver.getPlugin())
    receiver.getPlugin().getBalance().then((res) => {
        console.log(`Balance receiver: ${res}`);
    })
    .catch((err) => {
        console.log(err);
    });
});
