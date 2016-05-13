.. _run:

Running the Examples
====================
Details about each app is documented under:

* :ref:`ontherecord`
* :ref:`sharetrader`


The Easy Way
------------

.. code-block:: bash

    $ docker-compose up

Or, if you're using docker-machine instances (ie. on OSX / Windows),

.. code-block:: bash

    $ DOCKER_MACHINE_IP=$(docker-machine ip) docker-compose up

You should be able to view the "On the record" app at
`<http://localhost:32800/ontherecord/>`_, and the "Share Trader" app at
`<http://localhost:32800/sharetrader/>`_ (replace ``localhost`` with your docker-machine ip as
necessary)


The Hard Way
------------
Have three terminal shells (in ``bigchaindb-examples/``)

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


Running the App server
^^^^^^^^^^^^^^^^^^^^^^
In another terminal, launch the ``flask`` server

.. code-block:: bash

    $ python3 -m server.app

You should be able to view the "On the record" app at
`<http://localhost:8000/ontherecord/>`_, and the "Share Trader" app at 
`<http://localhost:8000/sharetrader/>`_.
