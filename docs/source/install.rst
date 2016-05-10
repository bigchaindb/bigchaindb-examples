Installation
============


.. _dependencies:

Dependencies
------------

 * LINUX dependencies: see `setup BigchainDB & RethinkDB <https://bigchaindb.readthedocs.io/en/latest/installing-server.html#install-and-run-rethinkdb-server>`_
 * ``python>=3.4``
 
For the JavaScript part, we recommend using `nvm <https://github.com/creationix/nvm#installation>`_.

Otherwise:
 
* `node>=5.3 <https://nodejs.org/en/download/>`_
* `npm>=3.3 <https://docs.npmjs.com/getting-started/installing-node>`_
* `webpack>=1.13.0 <https://webpack.github.io/docs/installation.html>`_


Setup
-----

Make sure you have all the :ref:`dependencies`.

.. code-block:: bash

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
