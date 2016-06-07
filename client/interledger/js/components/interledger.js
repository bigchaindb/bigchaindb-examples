import React from 'react';

import { Navbar } from 'react-bootstrap/lib';

import { safeMerge } from 'js-utility-belt/es6';

import AccountList from '../../../lib/js/react/components/accounts';

import AssetActions from '../../../lib/js/react/actions/asset_actions';
import AssetStore from '../../../lib/js/react/stores/asset_store';

const Interledger = React.createClass({

    getInitialState() {
        const assetStore = AssetStore.getState();

        return safeMerge(
            {
                activeAccount: null,
                activeAsset: null,
                activeLedger: null
            },
            assetStore
        );
    },

    componentDidMount() {
        AssetStore.listen(this.onChange);
    },

    componentWillUnmount() {
        AssetStore.unlisten(this.onChange);
        this.disconnectLedger(this.state.activeLedger);
    },

    onChange(state) {
        this.setState(state);
    },

    fetchAssetList({ accountToFetch }) {
        AssetActions.flushAssetList();
        if (accountToFetch) {
            AssetActions.fetchAssetList({
                accountToFetch
            });
        }
    },

    disconnectLedger(ledger) {
        if (ledger) {
            ledger.disconnect();
        }
    },
    
    handleAccountChange(account, ledger) {
        this.disconnectLedger(this.state.activeLedger);

        if (ledger) {
            ledger.on('incoming', this.handleLedgerChanges);
        }
        this.setState({
            activeAccount: account,
            activeLedger: ledger
        });

        const accountToFetch = account ? account.vk : null;
        this.fetchAssetList({
            accountToFetch
        });
    },
    
    resetActiveAccount() {
        this.handleAccountChange(null, null);
    },

    handleLedgerChanges(changes) {
        console.log('incoming: ', changes);
        const { activeAccount } = this.state;

        this.fetchAssetList({
            accountToFetch: activeAccount.vk
        });
    },

    setActiveAsset(asset) {
        this.setState({
            activeAsset: asset
        });
    },

    render() {
        const { activeAccount } = this.state;

        return (
            <div>
                <Navbar fixedTop inverse>
                    <h1 style={{ textAlign: 'center', color: 'white' }}>Interledger</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <AccountList
                                activeAccount={activeAccount}
                                appName="interledger"
                                handleAccountClick={this.handleAccountChange} />
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <div className="page-content">
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default Interledger;
