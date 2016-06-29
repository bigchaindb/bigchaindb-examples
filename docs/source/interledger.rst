Interledger Lab
===============

.. note:: **Work in progress**. 


Build the services:

.. code-block:: bash

    $ docker-compose -f ledgers.yml build

Run RethinkDB in the background:

.. code-block:: bash

    $ docker-compose -f ledgers.yml up -d rdb


Configure each ledger:

.. code-block:: bash

    $ docker-compose -f ledgers.yml run bdb-0 bigchaindb -y configure
    $ docker-compose -f ledgers.yml run bdb-1 bigchaindb -y configure

Initialize each ledger:

.. code-block:: bash

    $ docker-compose -f ledgers.yml run bdb-0 bigchaindb init
    $ docker-compose -f ledgers.yml run bdb-1 bigchaindb init

Initialize the accounts and assets:

.. code-block:: bash

    $ docker-compose -f ledgers.yml run bdb-0 python init_accounts.py
    $ docker-compose -f ledgers.yml run bdb-0 python init_assets.py

.. note:: Since each ledger/service (``bdb-0``, ``bdb-1``) is connected to the
    same RethinkDB instance, the initialization commands can be run with either
    service (``bdb-0``, or ``bdb-1``).

Start everything:

.. code-block:: bash

    $ docker-compose -f ledgers.yml up


To view each ledger in browser, visit:

* ``bdb-0``: http://localhost:32800
* ``bdb-1``: http://localhost:32810 

.. note:: Replace ``localhost`` with your docker-machine ip as necessary.
