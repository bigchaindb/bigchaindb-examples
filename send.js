import { Client } from 'ilp-core';

const sendingLedger = 'http://localhost:3001';
const sendingAccount = `${sendingLedger}/accounts/alice`;
const sendingPassword = 'alice';

const receivingLedger = 'http://localhost:3002';
const receivingAccount = `${receivingLedger}/accounts/bob`;
const receivingPassword = 'bob';

const payment = {
    destinationAccount: receivingAccount,
    destinationLedger: receivingLedger,
    destinationAmount: '1.2345',
    destinationMemo: {
        myKey: 'myValue'
    },
    executionCondition: 'cc:0:3:47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU:0',
    expiresAt: (new Date(Date.now() + 10000)).toISOString()
};


const receiver = new Client({
    type: 'bells',
    auth: {
        account: receivingAccount,
        password: receivingPassword
    }
});

receiver.on('receive', (transfer) => {
    console.log(transfer);
    receiver.fulfillCondition(transfer.id, 'cf:0:');
});

const sender = new Client({
    type: 'bells',
    auth: {
        account: sendingAccount,
        password: sendingPassword
    }
});

sender.waitForConnection().then(() => {
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
        sender.disconnect();
    });
});
