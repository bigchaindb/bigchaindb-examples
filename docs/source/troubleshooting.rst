Troubleshooting
===============

Oops ¯\\\_(ツ)\_/¯
------------------

My installation fails with:

.. code-block:: bash

    error: Setup script exited with error in BigchainDB setup command: 'install_requires' must be a string or list of strings containing valid project/version requirement specifiers

* **Solution**: update the ``setuptools``, see `PR fix <https://github.com/bigchaindb/bigchaindb/issues/236>`_


OMG: I've messed up my database
-------------------------------

* **Solution**: reset your bigchaindb_examples database
* **Warning**: the following resets your bigchaindb database to its default initialized state!

Via Docker
^^^^^^^^^^

.. code-block:: bash

    $ make init

Or, to reinitialize and restart:

.. code-block:: bash

    $ make restart


Via the CLI
^^^^^^^^^^^

.. code-block:: bash

    $ bigchaindb-examples init --all

Or, to reinitialize and restart:

.. code-block:: bash

    $ bigchaindb-examples start --init --all


Manually
^^^^^^^^

Restart your RethinkDB instance and follow the initialization steps in
:ref:`manual-setup`.
