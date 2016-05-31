import React from 'react/';

import { Navbar, Row, Col, Button } from 'react-bootstrap/lib/';

import Scroll from 'react-scroll';

import { safeMerge } from 'js-utility-belt/es6';

import Accounts from './accounts';
import Assets from './assets';
import Search from '../../../lib/js/react/components/search';
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
                searchQuery: null
            },
            assetStore,
            accountStore
        );
    },

    componentDidMount() {
        AssetStore.listen(this.onChange);
        AccountStore.listen(this.onChange);

        this.fetchAssetList();
        Scroll.animateScroll.scrollToBottom();
    },

    componentWillUnmount() {
        AssetStore.unlisten(this.onChange);
        AccountStore.unlisten(this.onChange);
    },

    onChange(state) {
        this.setState(state);
    },

    setActiveAccount(account) {
        this.setState({
            activeAccount: account
        });
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

    mapAccountsOnStates(accountList) {
        const states = { 'default': 'available' };

        if (!accountList) {
            return states;
        }

        for (let i = 0; i < accountList.length; i++) {
            states[accountList[i].vk] = `state${i}`;
        }

        return states;
    },

    fetchAssetList() {
        AssetActions.flushAssetList();
        const { activeAccount, searchQuery } = this.state;
        const accountPublicKey = activeAccount ? activeAccount.vk : null;

        AssetActions.fetchAssetList({ accountToFetch: accountPublicKey, search: searchQuery });

        setTimeout(this.fetchAssetList, 1000);
    },

    handleSearch(query) {
        this.setState({
            searchQuery: query
        });
    },

    render() {
        const { activeAccount, accountList, activeAsset, assetList, assetMeta } = this.state;
        const states = this.mapAccountsOnStates(accountList);

        return (
            <div>
                <Navbar fixedTop inverse>
                    <h1 style={{ textAlign: 'center', color: 'white' }}>Share Trader</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <Search
                                handleSearch={this.handleSearch}
                                initialQuery={assetMeta.search} />
                            <div style={{ textAlign: 'center' }}>
                                <Button
                                    onClick={this.resetActiveAccount}>
                                    Select All
                                </Button>
                            </div>
                            <Accounts
                                activeAccount={activeAccount}
                                handleAccountClick={this.setActiveAccount} />
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
                                                handleAssetClick={this.setActiveAsset}
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
                                        handleAssetClick={this.setActiveAsset} />
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
