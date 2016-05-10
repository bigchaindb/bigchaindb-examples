Share Trader
============

Share Trader is a simple share allocation and trade app. Each square represents
an asset that can be traded amongst accounts.

You should see the app running on `<http://localhost:8000/sharetrader/>`_

.. image:: /_static/sharetrader.png


Use cases
---------

- Reservation of tickets, seats in a concert/transport, ...
- Trade of limited issued assets

Functionality
-------------

Create assets
^^^^^^^^^^^^^

- assets are created following a structured payload
- the amount is limited

Transfer assets
^^^^^^^^^^^^^^^

- easy transfer of assets between accounts by:
    - clicking on an account first. This will give the assets for that account
    - clicking on an asset of that account. Transfer actions will appear on the
      right side.

Retrieve assets
^^^^^^^^^^^^^^^

- that you currently own (like UTXO's)
- all assets on bigchain
- state indicator (blinks if asset has various owners)

What this app doesn't provide
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
- Proper user and key management
- Proper signing of transfers
- Proper search by payload
