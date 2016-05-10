Running the Examples
====================

Have three terminal shells.

Running the javascript client
-----------------------------
In one terminal, run ``webpack`` to serve the static files

.. code-block:: bash

    $ webpack -w


Running BigchainDB
------------------
Launch ``BigchainDB`` in a separate terminal

.. code-block:: bash

    $ bigchaindb -c .bigchaindb_examples start


Running the App server
----------------------
In another terminal launch the ``gunicorn`` server (from the repository root
dir)

.. code-block:: bash

    $ python3 -m server.app
