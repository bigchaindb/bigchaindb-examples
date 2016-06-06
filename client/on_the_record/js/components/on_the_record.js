import React from 'react/';

import { Navbar } from 'react-bootstrap/lib/';

import Scroll from 'react-scroll';

import { safeMerge } from 'js-utility-belt/es6';
import { getScrollPosition } from 'js-utility-belt/es6/dom';

import AccountList from '../../../lib/js/react/components/accounts';
import Assets from './assets';
import Search from '../../../lib/js/react/components/search';

import AssetActions from '../../../lib/js/react/actions/asset_actions';
import AssetStore from '../../../lib/js/react/stores/asset_store';

import BigchainDBLedgerPlugin from '../../../lib/js/react/components/ledgerplugin';

const OnTheRecord = React.createClass({

    getInitialState() {
        const assetStore = AssetStore.getState();

        return safeMerge(
            {
                activeAccount: null,
                searchQuery: null,
                ledger: new BigchainDBLedgerPlugin({
                    auth: {
                        account: 'ws://localhost:8888/changes'
                    },
                })
            },
            assetStore
        );
    },

    componentDidMount() {
        AssetStore.listen(this.onChange);

        this.fetchAssetList();

        const { ledger } = this.state;
        ledger.connect().catch((err) => {
            console.error((err && err.stack) ? err.stack : err);
        });

        ledger.on('incoming', this.handleLedgerChanges);
        Scroll.animateScroll.scrollToBottom();
    },

    componentWillUnmount() {
        AssetStore.unlisten(this.onChange);

        const { ledger } = this.state;
        ledger.disconnect().catch((err) => {
            console.error((err && err.stack) ? err.stack : err);
        });
    },

    handleLedgerChanges(changes) {
        console.log('incoming: ', changes);
        this.fetchAssetList();
    },

    fetchAssetList(account) {
        AssetActions.flushAssetList();
        const { activeAccount, searchQuery } = this.state;

        const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (account || activeAccount) {
            AssetActions.fetchAssetList({ accountToFetch: account? account.vk : activeAccount.vk, search: searchQuery });

            if (maxScroll - getScrollPosition().y < 40) {
                Scroll.animateScroll.scrollToBottom();
            }
        }
    },

    onChange(state) {
        this.setState(state);
    },

    setActiveAccount(account) {
        this.setState({
            activeAccount: account
        });
        console.log('switched accounts:', account)
        this.fetchAssetList(account);
    },

    handleSearch(query) {
        this.setState({
            searchQuery: query
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
                                handleAccountClick={this.setActiveAccount} />
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
