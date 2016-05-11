Installation
============

Clone the repository:

.. code-block:: bash

    $ git clone git@github.com:bigchaindb/bigchaindb-examples.git

Go into it!

.. code-block:: bash

    $ cd bigchaindb-examples

We now document two options:

* One that is considered easy, if you consider using docker to be easy.
* One that is considered to be hard, if you consider installing different
  components, and required dependencies to be rarely a smooth process.
    

The Easy Way
------------
Just make sure you have recent versions of `docker engine`_ and
`docker-compose`_, e.g.:

.. code-block:: bash
    
    $ docker --version
    Docker version 1.11.1, build 5604cbe

    $ docker-compose --version
    docker-compose version 1.7.0, build 0d7bf73


Build the images:

.. code-block:: bash

    $ docker-compose build

Start ``RethinkDB`` in the backgroud:

.. code-block:: bash

    $ docker-compose up -d rdb

Configure ``BigchaninDB``:

.. code-block:: bash

    $ docker-compose run --rm bdb bigchaindb -y configure

Initialize ``BigchainDB``:

.. code-block:: bash
 
    $ docker-compose run --rm bdb bigchaindb init

Load initial data:

.. code-block:: bash

    $ docker-compose run --rm bdb python init_db.py


You should now be ready to run the examples. See :ref:`run` for instructions.


The Hard Way
------------
Good luck!

.. _dependencies:

Dependencies
^^^^^^^^^^^^

 * LINUX dependencies: see `setup BigchainDB & RethinkDB <https://bigchaindb.readthedocs.io/en/latest/installing-server.html#install-and-run-rethinkdb-server>`_
 * ``python>=3.4``
 
For the JavaScript part, we recommend using `nvm <https://github.com/creationix/nvm#installation>`_.

Otherwise:
 
* `node>=5.3 <https://nodejs.org/en/download/>`_
* `npm>=3.3 <https://docs.npmjs.com/getting-started/installing-node>`_
* `webpack>=1.13.0 <https://webpack.github.io/docs/installation.html>`_


Setup
^^^^^

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

    
You should now be ready to run the examples. See :ref:`run` for instructions.
 

.. _docker engine: https://www.docker.com/products/docker-engine
.. _docker-compose: https://www.docker.com/products/docker-compose
