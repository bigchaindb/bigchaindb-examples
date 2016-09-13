import BigchainDBLedgerPlugin from 'ilp-plugin-bigchaindb';

const connectToBigchainDBLedger = (account) => {
    const ledgerPlugin = new BigchainDBLedgerPlugin({
        auth: {
            account: {
                id: account.vk,
                key: account.sk,
                uri: {
                    api: `http://${account.ledger.api}`,
                    ws: `ws://${account.ledger.ws}`
                }
            },
            ledgerId: account.ledger.id
        },

    });

    ledgerPlugin.connect().catch(console.error);
    return ledgerPlugin;
};


export default connectToBigchainDBLedger;
