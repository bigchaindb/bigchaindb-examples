// import BigchainDBLedgerPlugin from './bigchaindb_ledgerplugin';
import BigchainDBLedgerPlugin from 'ilp-plugin-bigchaindb';
import { API_PATH } from '../constants/application_constants';

const connectToBigchainDBLedger = (account) => {
    const ledger = new BigchainDBLedgerPlugin({
        auth: {
            account: {
                id: account.vk,
                key: account.sk,
                uri: {
                    api: API_PATH,
                    ws: `ws://localhost:8888/users/${account.vk}`
                }
            }
        }
    });

    ledger.connect().catch(console.error);
    return ledger;
};


export default connectToBigchainDBLedger;
