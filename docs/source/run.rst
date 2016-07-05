.. _run:

Running the Examples
====================
Details about each app is documented under:

* :ref:`ontherecord`
* :ref:`sharetrader`
* :ref:`interledger`


Using bigchaidb-examples command line interface
------------

Reset the database
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

    $ bigchaindb-examples reset-all


Start all services
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Initialize the database and start all services

.. code-block:: bash

    $ bigchaindb-examples start --init --all


You should be able to view the "On the record" app at
`<http://localhost:3000/ontherecord/>`_, and the "Share Trader" app at
`<http://localhost:3000/sharetrader/>`_.


Using Docker
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