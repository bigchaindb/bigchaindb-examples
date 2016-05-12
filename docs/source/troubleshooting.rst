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
* **Warning**: the following resets your bigchaindb database as specified in the config file!

.. code-block:: bash
    
    # Drop database
    $ bigchaindb -c .bigchaindb_examples drop
    
    # Restart BigchainDB
    $ bigchaindb -c .bigchaindb_examples init
    $ bigchaindb -c .bigchaindb_examples start
    
    # Load initial data (app accounts will remain the same if not deleted)
    $ python3 init_db.py
