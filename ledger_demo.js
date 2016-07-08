import path from 'path';

import multiplexer from 'multiplexer';

class Demo {
    constructor(opts) {
        this.numLedgers = 2;
        this.numConnectors = 1;
        this.adminUser = 'admin';
        this.adminPass = 'admin';
    }

    createLedger(name, port) {
        const npmPrefix = 'npm';

        const currency = { code: 'USD', symbol: '$' };
        const dbUri = process.env.LEDGER_DB_URI || `sqlite://${path.resolve(__dirname, `../data/${name}.sqlite`)}`;
        return {
            env: {
                PATH: process.env.PATH,
                LEDGER_DB_URI: dbUri,
                LEDGER_DB_SYNC: true,
                LEDGER_HOSTNAME: 'localhost',
                LEDGER_PORT: port,
                LEDGER_ADMIN_USER: this.adminUser,
                LEDGER_ADMIN_PASS: this.adminPass,
                LEDGER_CURRENCY_CODE: currency.code,
                LEDGER_CURRENCY_SYMBOL: currency.symbol
            },
            cwd: './node_modules/five-bells-ledger',
            cmd: `${npmPrefix} start -- --color`,
            waitFor: 'listening',
            alias: `ledger-${name}`
        };
    }
    start() {
        const processes = [];
        for (let i = 1; i <= this.numLedgers; i++) {
            const port = 3000 + i;
            processes.push(this.createLedger(`ledger${i}`, port));
        }
        multiplexer(processes);
    }
}

export default Demo;
