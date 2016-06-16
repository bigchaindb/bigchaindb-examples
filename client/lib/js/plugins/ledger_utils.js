// import BigchainDBLedgerPlugin from './bigchaindb_ledgerplugin';
import BigchainDBLedgerPlugin from 'ilp-plugin-bigchaindb/build/main/bundle';


const connectToBigchainDBLedger = (publicKey) => {
    const ledger = new BigchainDBLedgerPlugin({
        auth: {
            account: {
                id: publicKey,
                uri: `ws://localhost:8888/users/${publicKey}`
            }
        }
    });

    ledger.connect().catch(console.error);
    return ledger;
};


export default connectToBigchainDBLedger;
