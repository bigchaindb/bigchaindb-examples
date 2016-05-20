.. _sharetrader:

Share Trader
============

Share Trader is a simple share allocation and trade app. Each square represents
an asset that can be traded amongst accounts.

.. image:: /_static/sharetrader.png


Use cases
---------

- Reservation of tickets, seats in a concert/transport, ...
- Trade of limited issued assets

Functionality
-------------

Create assets
^^^^^^^^^^^^^

- Assets are created following a structured payload
- The amount is limited

Transfer assets
^^^^^^^^^^^^^^^

- Easy transfer of assets between accounts by:
    - Clicking on an account first. This will give the assets for that account
    - Clicking on an asset of that account. Transfer actions will appear on the
      right side.

Retrieve assets
^^^^^^^^^^^^^^^

- That you currently own (like UTXO's)
- All assets on bigchain
- State indicator (blinks if asset has various owners)

What this app doesn't provide
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
- Proper user and key management
- Proper signing of transfers
- Proper search by payload
