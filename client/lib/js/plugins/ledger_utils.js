import BigchainDBLedgerPlugin from './bigchaindb_ledgerplugin';

import { TORNADO_BASE_URL } from '../constants/application_constants';


const connectToBigchainDBLedger = (publicKey) => {
    const ledger = new BigchainDBLedgerPlugin({
        auth: {
            account: {
                id: publicKey,
                uri: `${TORNADO_BASE_URL}/users/${publicKey}`
            }
        }
    });

    ledger.connect().catch(console.error);
    return ledger;
};


export default connectToBigchainDBLedger;
