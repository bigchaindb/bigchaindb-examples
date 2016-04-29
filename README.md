# BigchainDB Examples

This repo contains examples and tutorials for BigchainDB.

Warning: These examples are for demonstration purpose and should not be used for production

## Example: "On the Record"

"On the Record" is a simple logging app, wrapped as a messaging board.

### Use cases

- Immutable logging of data
- Notarization of data, text, emails

### Structure

The app is structured as follows:
- Client: ReactJS
- Server: Python Flask REST API server
- DB: BigchainDB

All messages are JSON based.

### How to install and run

#### BigchainDB Installation
See how to [setup BigchainDB (& RethinkDB)](https://bigchaindb.readthedocs.io/en/latest/installing-server.html#install-and-run-rethinkdb-server)

With the guidelines above, you can check whether you can launch bigchaindb and load some benchmarks

#### Examples Installation

- Dependencies: python3, [node>=5.3](https://nodejs.org/en/download/), [npm>=3.3](https://docs.npmjs.com/getting-started/installing-node), [webpack>=1.13.0](https://webpack.github.io/docs/installation.html)

```bash
# Clone the repository and install:
$ git clone git@github.com:bigchaindb/bigchaindb-examples.git
$ cd bigchaindb-examples

# (optional) Run a virtualenv
$ virtualenv venv -p python3
$ source venv/bin/activate

# Install server
$ python3 setup.py install

# Make sure RethinkDB is running!
# Load initial data
$ cd on_the_record
$ python3 load_users.py

# Install client (still in the same directory, on_the_record) 
$ npm install
```

#### Launch the App server and BigchainDB

Launch BigchainDB
```bash
$ bigchaindb start 
```

In another terminal launch the gunicorn server (from the repository root dir)
```bash
$ python3 -m on_the_record.server.server
```

Now you should see the app running on http://localhost:8000/

### Functionality

#### Create assets
- with arbitrary payload
- and an unlimited amount

#### Retrieve assets
- that you currently own (like UTXO's)
- by searching the asset data/payload

#### What this app doesn't provide

- Proper user and key management
- Transfer of assets

