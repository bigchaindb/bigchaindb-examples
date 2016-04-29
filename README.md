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

- Dependencies: python3, npm>=3.3, node>=5.3

```bash
# Clone the repository and install:
$ git clone git@github.com:bigchaindb/bigchaindb-examples.git
$ cd bigchaindb-examples

# (optional) Run a virtualenv
$ virtualenv venv -p python3
(optional)$ source venv/bin/activate

# Install server
$ python3 setup.py install

# Load initial data
$ cd on_the_record
$ python3 load_users.py

# Install client
$ webpack -b
```

#### Launch the App server and BigchainDB

```bash
$ bigchaindb start & python3 on_the_record/server.py
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

