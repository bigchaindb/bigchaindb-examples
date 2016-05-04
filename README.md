# BigchainDB Examples

This repo contains examples and tutorials for BigchainDB.

__Warning__: These examples are for demonstration purpose and should not be used for production

## Table of Contents
- [Installation](#installation)
- [Example: "On the Record"](#example-on-the-record)
- [Example: Share Trader](#example-share-trader)

## Installation

### Structure

The apps are structured as follows:
- Client: ReactJS
- Server: Python Flask REST API server
- DB: BigchainDB

All messages are JSON based.

### Dependencies


 - LINUX dependencies: see [setup BigchainDB & RethinkDB](https://bigchaindb.readthedocs.io/en/latest/installing-server.html#install-and-run-rethinkdb-server)
 - python>=3.4
 
For the JavaScript part, we recommend using nvm, see [here](https://github.com/creationix/nvm#installation).

Otherwise:
 - [node>=5.3](https://nodejs.org/en/download/) 
 - [npm>=3.3](https://docs.npmjs.com/getting-started/installing-node) 
 - [webpack>=1.13.0](https://webpack.github.io/docs/installation.html)

### Setup

```bash
# Clone the repository and install:
$ git clone git@github.com:bigchaindb/bigchaindb-examples.git
$ cd bigchaindb-examples

# (optional) Run a virtualenv
$ virtualenv venv -p python3
$ source venv/bin/activate

# Install server
$ pip install -e .[dev]

# Make sure RethinkDB is running!
# Configure BigchainDB with a different BIGCHAINDB_DATABASE_NAME
$ BIGCHAINDB_DATABASE_NAME=bigchaindb_examples \
 bigchaindb -yc .bigchaindb_examples configure 

# Initialize BigchainDB
$ bigchaindb -c .bigchaindb_examples init 

# Load initial data 
$ python3 init_db.py

# Install client
$ npm install

# when in dev mode
$ webpack -w
```

### Launch BigchainDB

Launch BigchainDB in a separate terminal

```bash
$ bigchaindb -c .bigchaindb_examples start 
```

### Launch the App server

In another terminal launch the gunicorn server (from the repository root dir)
```bash
$ python3 -m server.app
```

### Oops ¯\\\_(ツ)\_/¯

##### My installation fails with:

```
error: Setup script exited with error in BigchainDB setup command: 'install_requires' must be a string or list of strings containing valid project/version requirement specifiers
```

- __Solution__: update the `setuptools`, see PR fix [here](https://github.com/bigchaindb/bigchaindb/issues/236)


##### OMG: I've messed up my database

- __Solution__: reset your bigchaindb_examples database
- __Warning__: the following resets your bigchaindb database as specified in the config file!

```bash
# Drop database
$ bigchaindb -c .bigchaindb_examples drop

# Restart BigchainDB
$ bigchaindb -c .bigchaindb_examples init
$ bigchaindb -c .bigchaindb_examples start

# Load initial data (app accounts will remain the same if not deleted)
$ python3 init_db.py
```

## Example: "On the Record"

"On the Record" is a simple logging app, wrapped as a messaging board.

You should see the app running on [http://localhost:8000/ontherecord/](http://localhost:8000/ontherecord/)

<p align="center">
  <img width="70%" height="70%" src ="./docs/img/on_the_record_v0.0.1.png" />
</p>

### Use cases

- Immutable logging of data
- Notarization of data, text, emails

### Functionality

#### Create assets
- with arbitrary payload
- and an unlimited amount

#### Retrieve assets
- that you currently own (like UTXO's)
- by searching the asset data/payload
- state indicator (in backlog vs. on bigchain)

#### What this app doesn't provide

- Proper user and key management
- Transfer of assets

## Example: Share Trader

Share Trader is a simple share allocation and trade app. Each square represents an asset that can be traded amongst accounts.

You should see the app running on [http://localhost:8000/sharetrader/](http://localhost:8000/sharetrader/)

<p align="center">
  <img width="70%" height="70%" src ="./docs/img/share_trader_v0.0.1.png" />
</p>

### Use cases

- Reservation of tickets, seats in a concert/transport, ...
- Trade of limited issued assets

### Functionality

#### Create assets
- assets are created following a structured payload
- the amount is limited

#### Transfer assets
- easy transfer of assets between accounts by:
 - clicking on an account first. This will give the assets for that account
 - clicking on an asset of that account. Transfer actions will appear on the right side.

#### Retrieve assets
- that you currently own (like UTXO's)
- all assets on bigchain
- state indicator (blinks if asset has various owners)

#### What this app doesn't provide

- Proper user and key management
- Proper signing of transfers
- Proper search by payload

## Acknowledgements:

Special thanks to the BigchainDB/ascribe.io team for their insights and code contributions:

@r-marques, @vrde, @ttmc, @rhsimplex, @SohKai, @sbellem, @TimDaub
