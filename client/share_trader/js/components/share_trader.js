import React from 'react';

import { Navbar, Row, Col, Button } from 'react-bootstrap/lib';

import { safeMerge } from 'js-utility-belt/es6';

import AccountList from '../../../lib/js/react/components/accounts';
import Assets from './assets';
import AssetMatrix from './asset_matrix';

import AssetActions from '../../../lib/js/react/actions/asset_actions';
import AssetStore from '../../../lib/js/react/stores/asset_store';

import AccountStore from '../../../lib/js/react/stores/account_store';


const ShareTrader = React.createClass({

    getInitialState() {
        const assetStore = AssetStore.getState();
        const accountStore = AccountStore.getState();

        return safeMerge(
            {
                activeAccount: null,
                activeAsset: null,
                activeLedger: null
            },
            assetStore,
            accountStore
        );
    },

    componentDidMount() {
        AssetStore.listen(this.onChange);
        AccountStore.listen(this.onChange);

        this.fetchAssetList({
            accountToFetch: null
        });
    },

    componentWillUnmount() {
        AssetStore.unlisten(this.onChange);
        AccountStore.unlisten(this.onChange);
    },

    onChange(state) {
        this.setState(state);
    },

    fetchAssetList({ accountToFetch }) {
        AssetActions.flushAssetList();

        AssetActions.fetchAssetList({
            accountToFetch
        });
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

    handleAssetChange(asset) {
        this.setState({
            activeAsset: asset
        });
    },

    mapAccountsOnStates(accountList) {
        const states = {
            'default': 'available'
        };

        if (!accountList) {
            return states;
        }

        for (let i = 0; i < accountList.length; i++) {
            states[accountList[i].vk] = `state${i}`;
        }

        return states;
    },


    render() {
        const { activeAccount, accountList, activeAsset, assetList } = this.state;
        const states = this.mapAccountsOnStates(accountList);

        return (
            <div>
                <Navbar fixedTop inverse>
                    <h1 style={{ textAlign: 'center', color: 'white' }}>Share Trader</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <div style={{ textAlign: 'center' }}>
                                <Button
                                    onClick={this.resetActiveAccount}>
                                    Select All
                                </Button>
                            </div>
                            <AccountList
                                activeAccount={activeAccount}
                                appName="sharetrader"
                                handleAccountClick={this.handleAccountChange} />
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <div className="page-content">
                            <Row>
                                <Col className="asset-matrix" md={8} xs={6}>
                                    <div className="vertical-align-outer">
                                        <div className="vertical-align-inner">
                                            <AssetMatrix
                                                cols={8}
                                                handleAssetClick={this.handleAssetChange}
                                                rows={8}
                                                states={states} />
                                        </div>
                                    </div>
                                </Col>
                                <Col className="asset-history" md={4} xs={6}>
                                    <Assets
                                        accountList={accountList}
                                        activeAccount={activeAccount}
                                        activeAsset={activeAsset}
                                        assetClasses={states}
                                        assetList={assetList}
                                        handleAssetClick={this.handleAssetChange} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default ShareTrader;
