Installation
============

Clone the repository:

.. code-block:: bash

    $ git clone git@github.com:bigchaindb/bigchaindb-examples.git

Go into it!

.. code-block:: bash

    $ cd bigchaindb-examples

We now document three options:

* Installing via Docker (**recommended**); supports OSX
* Installing via the CLI and running locally
* Installing from source and running locally


The Docker Way
--------------
Just make sure you have recent versions of `docker engine`_ and
`docker-compose`_, e.g.:

.. code-block:: bash

    $ docker --version
    Docker version 1.11.1, build 5604cbe

    $ docker-compose --version
    docker-compose version 1.7.0, build 0d7bf73


We've provided a `Makefile` to make starting the examples through Docker easy, so once you've set
up your docker environment (e.g. starting docker-machine if necessary), simply:

.. code-block:: bash

    # Build the images
    $ docker-compose build

    # Make all the things! Inits, configures, and runs everything.
    $ make


If you're using docker-machine instances (ie. on OSX / Windows), you should run `make` with your
docker-machine ip:

.. code-block:: bash

    $ DOCKER_MACHINE_IP=$(docker-machine ip) make


The `Makefile` will automatically start the examples so just sit back and wait :)


Install from Source
-------------------

.. _dependencies:

Dependencies
^^^^^^^^^^^^

 * OS dependencies: see `setup BigchainDB & RethinkDB <https://bigchaindb.readthedocs.io/en/latest/installing-server.html#install-and-run-rethinkdb-server>`_
 * ``python>=3.4``
 * node>=5.3 using `nvm <https://github.com/creationix/nvm#installation>`_ (**recommended**), or
   `manually <https://nodejs.org/en/download/>`_
 * `npm>=3.3 <https://docs.npmjs.com/getting-started/installing-node>`_ (should be installed with node)


Using the CLI
^^^^^^^^^^^^^

This examples project includes a CLI tool to configure and start the project. If you'll be running
things locally, it's **recommended** to use the CLI.

.. code-block:: bash

    # (optional) Run a virtualenv (make sure you have a recent version)
    $ virtualenv venv -p python3
    $ source venv/bin/activate

    # Install server
    $ pip install -e .[dev]

    # (optional) Check out the CLI
    $ bigchaindb-examples --help

    # Initialize BigchainDB and load initial data
    $ bigchaindb-examples init --all

    # Install client dependencies
    $ cd client && npm install && cd -


The CLI will handle any initialization that's necessary for the client and servers so you can skip
to :ref:`run` to begin running the examples.


Manual Setup
^^^^^^^^^^^^

Make sure you have all the :ref:`dependencies`.

.. code-block:: bash

    # (optional) Run a virtualenv (make sure you have a recent version)
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
    $ python3 init_accounts.py
    $ python3 init_assets.py

    # Install client dependencies
    $ cd client && npm install && cd -


You should now be ready to run the examples. See :ref:`run` for instructions.



.. _docker engine: https://www.docker.com/products/docker-engine
.. _docker-compose: https://www.docker.com/products/docker-compose
