import React from 'react/';

import { Navbar, Row, Col, Button } from 'react-bootstrap/lib/';

import { safeMerge } from 'js-utility-belt/es6';

import AccountList from '../../../lib/js/react/components/accounts';
// import Assets from './assets';

import AssetActions from '../../../lib/js/react/actions/asset_actions';
import AssetStore from '../../../lib/js/react/stores/asset_store';

const Interledger = React.createClass({

    getInitialState() {
        const assetStore = AssetStore.getState();

        return safeMerge(
            {
                activeAccount: null,
                activeAsset: null,
                activeLedger: null,
                searchQuery: null
            },
            assetStore
        );
    },

    componentDidMount() {
        AssetStore.listen(this.onChange);
        this.fetchAssetList();
    },

    componentWillUnmount() {
        AssetStore.unlisten(this.onChange);
        this.disconnectLedger(this.state.activeLedger);
    },

    onChange(state) {
        this.setState(state);
    },

    fetchAssetList() {
        AssetActions.flushAssetList();
        const { activeAccount, searchQuery } = this.state;
        const accountPublicKey = activeAccount ? activeAccount.vk : null;

        AssetActions.fetchAssetList({ accountToFetch: accountPublicKey, search: searchQuery });
    },

    disconnectLedger(ledger) {
        if (ledger) {
            ledger.disconnect();
        }
    },

    handleLedgerChanges(changes) {
        console.log('incoming: ', changes);
        this.fetchAssetList();
    },

    handleAccountChange(account, ledger) {
        this.disconnectLedger(this.state.activeLedger);
        ledger.on('incoming', this.handleLedgerChanges);

        this.setState({
            activeAccount: account,
            activeLedger: ledger
        });

        console.log('switched accounts:', account);
        this.fetchAssetList(account);
    },

    resetActiveAccount() {
        this.setState({
            activeAccount: null
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
