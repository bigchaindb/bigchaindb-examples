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
    { code: 'EUR', symbol: '€' },
    { code: 'CAD', symbol: 'C' }
];

const externalLedgers = [
    {
        code: 'STC',
        symbol: 'S',
        type: 'bigchaindb',
        api: 'http://localhost:8000',
        ws: 'ws://localhost:8888',
        connectors: {
            mark: {
                id: 'HyGLhUNpqZXNWhbbgwrmgsFazoFftSka9EEiSVfb6oBb',
                key: 'AgVGBc2vQxUuySjs21doweyNCip5REW5hquHnuBPJzLF'
            },
            martin: {
                id: 'HXNXJXtso12LpYiECMFv6wS9P6gZurx56c7gCarDqmTa',
                key: '2b8NJhirTk4bhHWMusHf2RjEs98KPu7b4mZ7i84Uvto1'
            },
            mary: {
                id: '6LkSZMyjUiPyqsajnNJEsvj6RWRcio6r3keaZfKPhdSH',
                key: 'FySyJ2HUm5gPcprJMh3ZWMXFG25fiAFdELppLV3ABgLQ'
            }
        }
    }
];

const portOffset = externalLedgers.length;

class JukeBoxServices {
    constructor(opts) {
        const _this = this;

        this.adminUser = 'admin';
        this.adminPass = 'admin';

        this.numLedgers = 3 - externalLedgers.length;
        this.numConnectors = 3;
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
            this.numLedgers + externalLedgers.length,
            this.barabasiAlbertConnectedCore,
            this.barabasiAlbertConnectionsPerNewNode);
        this.connectorEdges = new Array(this.numConnectors);
        for (let i = 0; i < this.numConnectors; i++) {
            this.connectorEdges[i] = [];
        }
        this.graph.edges.forEach((edge, i) => {
            if (edge.target < externalLedgers.length) {
                edge.target_currency = externalLedgers[edge.target].code;
                edge.target = externalLedgers[edge.target].api;
            } else {
                edge.target_currency = currencies[edge.target % currencies.length].code;
                edge.target = `http://localhost:${(3001 + edge.target)}`;
            }

            if (edge.source < externalLedgers.length) {
                edge.source_currency = externalLedgers[edge.source].code;
                edge.source = externalLedgers[edge.source].api;
            } else {
                edge.source_currency = currencies[edge.source % currencies.length].code;
                edge.source = `http://localhost:${(3001 + edge.source)}`;
            }
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
        if (ledger.indexOf('8') > -1) {
            const connector = externalLedgers[0].connectors[name];
            return Object.assign(
                {
                    username: name,
                    password: name
                },
                {
                    type: externalLedgers[0].type,
                    auth: {
                        account: {
                            id: connector.id,
                            key: connector.key,
                            uri: {
                                api: externalLedgers[0].api,
                                ws: externalLedgers[0].ws
                            }
                        },
                        ledgerId: externalLedgers[0].api
                    },
                    account_uri: `${externalLedgers[0].api}/accounts/${connector.id}`
                }
            );
        } else {
            return {
                account_uri: `${ledger}/accounts/${encodeURIComponent(name)}`,
                username: name,
                password: name
            };
        }
    }

    createConnector(name, port, edges) {
        const creds = {};
        const pairs = [];
        for (const edge of edges) {
            creds[edge.source] = JukeBoxServices.makeCredentials(edge.source, name);
            creds[edge.target] = JukeBoxServices.makeCredentials(edge.target, name);
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
                CONNECTOR_BACKEND: 'one-to-one',
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
            cmd: './jukebox/scripts/create-account.js',
            alias: `create-account-${name}`
        };
    }

    start() {
        const processes = [];
        const accounts = [];
        const connectors = [];

        for (let i = 1; i <= this.numLedgers; i++) {
            const port = 3000 + portOffset + i;
            processes.push(this.createLedger(`ledger${i}`, port));
            accounts.push(this.createAccount(`http://localhost:${port}`, 'alice'));
            accounts.push(this.createAccount(`http://localhost:${port}`, 'bob'));
            for (let j = 0; j < this.numConnectors; j++) {
                accounts.push(this.createAccount(`http://localhost:${port}`, connectorNames[j]));
            }
        }

        for (let i = 0; i < this.numConnectors; i++) {
            connectors.push(this.createConnector(connectorNames[i] || `connector${i}`,
                4001 + i, this.connectorEdges[i]));
        }
        multiplexer(processes.concat(connectors, accounts));
    }
}

export default JukeBoxServices;
