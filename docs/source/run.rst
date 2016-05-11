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


You should be able to view the "On the record" app at
`<http://localhost:32800/ontherecord/>`_, and the "Share Trader" app at 
`<http://localhost:32800/sharetrader/>`_.


The Hard Way
------------
Have three terminal shells.

Running the javascript client
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
In one terminal, run ``webpack`` to serve the static files

.. code-block:: bash

    $ webpack -w


Running BigchainDB
^^^^^^^^^^^^^^^^^^
Launch ``BigchainDB`` in a separate terminal

.. code-block:: bash

    $ bigchaindb -c .bigchaindb_examples start


Running the App server
^^^^^^^^^^^^^^^^^^^^^^
In another terminal launch the ``gunicorn`` server (from the repository root
dir)

.. code-block:: bash

    $ python3 -m server.app

You should be able to view the "On the record" app at
`<http://localhost:8000/ontherecord/>`_, and the "Share Trader" app at 
`<http://localhost:8000/sharetrader/>`_.
