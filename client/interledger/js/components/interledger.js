import React from 'react';

import { Navbar } from 'react-bootstrap/lib';

import { safeMerge } from 'js-utility-belt/es6';

import AccountList from '../../../lib/js/react/components/accounts';
import AccountDetail from './account_detail';

import AssetActions from '../../../lib/js/react/actions/asset_actions';
import AssetStore from '../../../lib/js/react/stores/asset_store';

const Interledger = React.createClass({

    getInitialState() {
        const assetStore = AssetStore.getState();

        return safeMerge(
            {
                activeAccount: null,
                activeAsset: null
            },
            assetStore
        );
    },

    componentDidMount() {
        AssetStore.listen(this.onChange);
    },

    componentWillUnmount() {
        AssetStore.unlisten(this.onChange);
    },

    onChange(state) {
        this.setState(state);
    },

    fetchAssetList({ accountToFetch }) {
        if (accountToFetch) {
            AssetActions.fetchAssetList({
                accountToFetch
            });
        }
    },
    
    handleAccountChange(account) {
        if (account.ledger) {
            account.ledger.on('incoming', this.handleLedgerChanges);
        }
        this.setState({
            activeAccount: account
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
        const { activeAccount, assetList } = this.state;

        return (
            <div>
                <Navbar fixedTop inverse>
                    <h1 style={{ textAlign: 'center', color: 'white' }}>Interledger</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="page-content-wrapper">
                        <div className="page-content">
                            <AccountList
                                activeAccount={activeAccount}
                                appName="interledger"
                                className="row"
                                handleAccountClick={this.handleAccountChange} >
                                <AccountDetail
                                    assetList={assetList} />
                            </AccountList>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default Interledger;
