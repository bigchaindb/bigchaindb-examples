import path from 'path';

import multiplexer from 'multiplexer';
import randomgraph from 'randomgraph';


const connectorNames = [
    'mark', 'mary', 'martin', 'millie',
    'mia', 'mike', 'mesrop', 'michelle',
    'milo', 'miles', 'michael', 'micah', 'max'
];

const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' }
];


class Demo {
    constructor(opts) {
        const _this = this;

        this.numLedgers = 2;
        this.numConnectors = 1;

        this.adminUser = 'admin';
        this.adminPass = 'admin';

        this.barabasiAlbertConnectedCore = opts.barabasiAlbertConnectedCore || 2;
        this.barabasiAlbertConnectionsPerNewNode = opts.barabasiAlbertConnectionsPerNewNode || 2;

        this.npmPrefix = 'npm';

        // Connector graph
        // Barabási–Albert (N, m0, M)
        //
        // N .. number of nodes
        // m0 .. size of connected core (m0 <= N)
        // M .. (M <= m0)
        this.graph = randomgraph.BarabasiAlbert(
            this.numLedgers,
            this.barabasiAlbertConnectedCore,
            this.barabasiAlbertConnectionsPerNewNode);
        this.connectorEdges = new Array(this.numConnectors);
        for (let i = 0; i < this.numConnectors; i++) {
            this.connectorEdges[i] = [];
        }
        this.graph.edges.forEach((edge, i) => {
            edge.source_currency = currencies[edge.source % currencies.length].code;
            edge.target_currency = currencies[edge.target % currencies.length].code;
            edge.source = `http://localhost:${(3001 + edge.source)}`;
            edge.target = `http://localhost:${(3001 + edge.target)}`;
            _this.connectorEdges[i % _this.numConnectors].push(edge);
        });
    }

    createLedger(name, port) {
        const currency = currencies[Math.floor(Math.random() * currencies.length)];
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
            cmd: `${this.npmPrefix} start -- --color`,
            waitFor: 'listening',
            alias: `ledger-${name}`
        };
    }

    static makeCredentials(ledger, name) {
        return {
            account_uri: `${ledger}/accounts/${encodeURIComponent(name)}`,
            username: name,
            password: name
        };
    }

    createConnector(name, port, edges) {
        const creds = {};
        const pairs = [];
        for (const edge of edges) {
            creds[edge.source] = Demo.makeCredentials(edge.source, name);
            creds[edge.target] = Demo.makeCredentials(edge.target, name);
            pairs.push([
                `${edge.source_currency}@${edge.source}`,
                `${edge.target_currency}@${edge.target}`
            ]);
            pairs.push([
                `${edge.target_currency}@${edge.target}`,
                `${edge.source_currency}@${edge.source}`
            ]);
        }

        return {
            env: {
                CONNECTOR_CREDENTIALS: JSON.stringify(creds),
                CONNECTOR_DEBUG_AUTOFUND: '1',
                CONNECTOR_PAIRS: JSON.stringify(pairs),
                CONNECTOR_MAX_HOLD_TIME: 600,
                CONNECTOR_SPREAD: 0,
                PATH: process.env.PATH,
                CONNECTOR_HOSTNAME: 'localhost',
                CONNECTOR_PORT: port,
                CONNECTOR_ADMIN_USER: this.adminUser,
                CONNECTOR_ADMIN_PASS: this.adminPass
            },
            cwd: './node_modules/five-bells-connector',
            cmd: `${this.npmPrefix} start -- --color`,
            alias: `connector-${name}`
        };
    }

    createAccount(ledger, name) {
        return {
            env: {
                PATH: process.env.PATH,
                LEDGER: ledger,
                USERNAME: name,
                ADMIN_USER: this.adminUser,
                ADMIN_PASS: this.adminPass
            },
            cwd: './',
            cmd: './scripts/create-account.js',
            alias: `create-account-${name}`
        };
    }

    start() {
        const processes = [];
        const accounts = [];
        const connectors = [];

        for (let i = 1; i <= this.numLedgers; i++) {
            const port = 3000 + i;
            processes.push(this.createLedger(`ledger${i}`, port));
            accounts.push(this.createAccount(`http://localhost:${port}`, 'alice'));
            accounts.push(this.createAccount(`http://localhost:${port}`, 'bob'));
        }

        for (let i = 0; i < this.numConnectors; i++) {
            connectors.push(this.createConnector(connectorNames[i] || `connector${i}`,
                4001 + i, this.connectorEdges[i]));
        }
        
        multiplexer(processes.concat(connectors, accounts));
    }
}

export default Demo;
