import React from 'react';

import { Navbar } from 'react-bootstrap/lib';

import Scroll from 'react-scroll';

import { safeMerge } from 'js-utility-belt/es6';

import AccountList from '../../../lib/js/react/components/accounts';
import Assets from './assets';
import Search from '../../../lib/js/react/components/search';

import AssetActions from '../../../lib/js/react/actions/asset_actions';
import AssetStore from '../../../lib/js/react/stores/asset_store';

const OnTheRecord = React.createClass({

    getInitialState() {
        const assetStore = AssetStore.getState();

        return safeMerge(
            {
                activeAccount: null,
                activeLedger: null,
                search: null
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

    fetchAssetList({ accountToFetch, search }) {
        AssetActions.flushAssetList();

        if (accountToFetch) {
            AssetActions.fetchAssetList({
                accountToFetch,
                search
            });
            Scroll.animateScroll.scrollToBottom();
        }
    },

    disconnectLedger(ledger) {
        if (ledger) {
            ledger.disconnect();
        }
    },

    handleAccountChange(account, ledger) {
        this.disconnectLedger(this.state.activeLedger);
        ledger.on('incoming', this.handleLedgerChanges);

        this.setState({
            activeAccount: account,
            activeLedger: ledger
        });

        this.fetchAssetList({
            accountToFetch: account.vk,
            search: this.state.search
        });
    },

    handleLedgerChanges(changes) {
        console.log('incoming: ', changes);
        const { activeAccount, search } = this.state;

        this.fetchAssetList({
            accountToFetch: activeAccount.vk,
            search
        });
    },

    handleSearch(query) {
        const { activeAccount } = this.state;

        this.setState({
            search: query
        });

        this.fetchAssetList({
            accountToFetch: activeAccount.vk,
            search: query
        });
    },

    render() {
        const { activeAccount, assetList, assetMeta } = this.state;

        let content = (
            <div className="content-text">
                Select account from the list...
            </div>
        );

        if (activeAccount) {
            content = (
                <Assets
                    activeAccount={activeAccount}
                    assetList={assetList} />
            );
        }

        return (
            <div>
                <Navbar fixedTop inverse>
                    <h1 style={{ textAlign: 'center', color: 'white' }}>"On the Record"</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <Search
                                handleSearch={this.handleSearch}
                                initialQuery={assetMeta.search} />
                            <AccountList
                                activeAccount={activeAccount}
                                appName="ontherecord"
                                handleAccountClick={this.handleAccountChange} />
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <div className="page-content">
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});


export default OnTheRecord;
