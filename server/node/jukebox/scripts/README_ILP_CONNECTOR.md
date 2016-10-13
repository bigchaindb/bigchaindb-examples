
# Install npm modules
```
cd server/node
npm install
npm install -g ilp-connector-cli
```

# Start Ledgers:

## Five bells (SQL)

### Launch
```
cd server/node/jukebox
LEDGER_PORT=3001 LEDGER_HOSTNAME=localhost LEDGER_ILP_PREFIX=3001. LEDGER_ADMIN_USER=admin LEDGER_ADMIN_PASS=admin LEDGER_DB_SYNC=1 LEDGER_DB_URI=sqlite://:memory: npm start
```

### Populate DB

- Install/open the postman chrome-plugin
- Load and run `scripts/createAccounts.postman_collection.json`

## BigchainDB

```
# (virtualenv and source)
# (optionally)
# bigchaindb-examples reset-all
# bigchaindb-examples init-all

# bigchaindb-examples start --all
```

# Launch Connector

```
ilp-connector-run bdb-conn.json fb-conn-0.json
```

Note that `bdb-conn.json` is using a predefined keypair:
- verifying key: `id`
- signing key: `key`