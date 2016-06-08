import React from 'react';

import { Navbar } from 'react-bootstrap/lib';

import Scroll from 'react-scroll';

import { safeMerge } from 'js-utility-belt/es6';

import AccountList from '../../../lib/js/react/components/accounts';
import AccountDetail from '../../../lib/js/react/components/account_detail';

import Assets from './assets';
import Search from '../../../lib/js/react/components/search';

import AccountStore from '../../../lib/js/react/stores/account_store';

import AssetActions from '../../../lib/js/react/actions/asset_actions';
import AssetStore from '../../../lib/js/react/stores/asset_store';

const OnTheRecord = React.createClass({

    getInitialState() {
        const accountStore = AccountStore.getState();
        const assetStore = AssetStore.getState();

        return safeMerge(
            {
                activeAccount: null,
                search: null
            },
            accountStore,
            assetStore
        );
    },

    componentDidMount() {
        AccountStore.listen(this.onAccountStoreChange);
        AssetStore.listen(this.onChange);
    },

    componentWillUnmount() {
        AccountStore.unlisten(this.onAccountStoreChange);
        AssetStore.unlisten(this.onChange);
    },

    onChange(state) {
        this.setState(state);
    },

    onAccountStoreChange(state) {
        const oldAccountList = this.state.accountList;
        state.accountList.forEach((account) => {
            if (account.ledger &&
                (!oldAccountList ||
                 (oldAccountList && oldAccountList.indexOf(account) === -1))) {
                account.ledger.on('incoming', this.handleLedgerChanges);
            }
        });

        this.setState(state);
    },

    fetchAssetList({ accountToFetch, search }) {
        if (accountToFetch) {
            AssetActions.fetchAssetList({
                accountToFetch,
                search,
                blockWhenFetching: true
            });
        }
    },

    handleAccountChange(account) {

        this.setState({
            activeAccount: account
        });

        Scroll.animateScroll.scrollToBottom();
    },

    handleLedgerChanges(changes) {
        console.log('incoming: ', changes);
        const { activeAccount, search } = this.state;

        this.fetchAssetList({
            accountToFetch: activeAccount.vk,
            search
        });
        
        Scroll.animateScroll.scrollToBottom();
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
                                handleAccountClick={this.handleAccountChange} >
                                <AccountDetail />
                            </AccountList>
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <div className="page-content">
                            <Assets
                                activeAccount={activeAccount}
                                assetList={assetList} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});


export default OnTheRecord;
