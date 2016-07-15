.. _run:

Running the Examples
====================
Details about each app is documented under:

* :ref:`ontherecord`
* :ref:`sharetrader`
* :ref:`interledger`


Docker
------

Use the provided `Makefile` to configure, initialize, and start running on Docker all in one go:

.. code-block:: bash

    $ make

Or, if you're using docker-machine instances (ie. on OSX / Windows),

.. code-block:: bash

    $ DOCKER_MACHINE_IP=$(docker-machine ip) make

You should be able to view the app at `<http://localhost:33000/>`_ (replace ``localhost`` with your
docker-machine ip as necessary).


Locally
-------

Using the CLI
^^^^^^^^^^^^^

.. code-block:: bash

    $ bigchaindb-examples start --init --all

Starting Everything Manually
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Not for the faint of heart; use the CLI instead!

You'll need to run at least two instances of BigchainDB along with a Flask and a Tornado server for
each instance (Flask should be run under ports 8000 and 8001; Tornado should be run under 8888 and
8889).

Running the javascript client
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
In one terminal, run ``npm start`` in ``client/`` to serve the client apps

.. code-block:: bash

    $ cd client
    $ npm start


Running BigchainDB
^^^^^^^^^^^^^^^^^^
Launch ``BigchainDB`` with ``RethinkDB`` in a separate terminal

.. code-block:: bash

    $ rethinkdb &   # skip this if RethinkDB is already running
    $ bigchaindb -c .bigchaindb_examples start


Running the App servers
^^^^^^^^^^^^^^^^^^^^^^^
In another terminal, launch the ``flask`` server

.. code-block:: bash

    $ python3 -m server.app

In (yet) another terminal, launch the ``tornado`` server

.. code-block:: bash

    $ python3 -m server.tornado_app

You should be able to view the app at `<http://localhost:3000/>`_.
