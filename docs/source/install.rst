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


Setup
^^^^^

Make sure you have all the :ref:`dependencies`.

.. code-block:: bash

    # Clone the repository and install:
    $ git clone git@github.com:bigchaindb/bigchaindb-examples.git
    $ cd bigchaindb-examples
    
    # (optional) Run a virtualenv (make sure you have a recent version)
    $ virtualenv venv -p python3
    $ source venv/bin/activate
    
    # Install server
    $ pip install -e .[dev]
    
    # Make sure RethinkDB is running!
    # Configure BigchainDB with a different BIGCHAINDB_DATABASE_NAME
    $ BIGCHAINDB_DATABASE_NAME=bigchaindb_examples \
     bigchaindb -yc .bigchaindb_examples configure
    
    # Install client dependencies
    $ cd client && npm install && cd -

    
You should now be ready to run the examples. See :ref:`run` for instructions.


The Docker Way
--------------
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

Configure ``BigchainDB``:

.. code-block:: bash

    $ touch .bigchaindb     # if the file is not there docker will create a dir
    $ docker-compose run --rm bdb bigchaindb -y configure

Initialize ``BigchainDB``:

.. code-block:: bash
 
    $ docker-compose run --rm bdb bigchaindb init

Load initial data:

.. code-block:: bash

    $ docker-compose run --rm bdb python init_db.py


You should now be ready to run the examples. See :ref:`run` for instructions.

 

.. _docker engine: https://www.docker.com/products/docker-engine
.. _docker-compose: https://www.docker.com/products/docker-compose
