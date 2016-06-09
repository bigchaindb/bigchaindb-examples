import React from 'react';

import { Navbar } from 'react-bootstrap/lib';

import Scroll from 'react-scroll';

import AccountList from '../../../lib/js/react/components/accounts';
import AccountDetail from '../../../lib/js/react/components/account_detail';

import Assets from './assets';
import Search from '../../../lib/js/react/components/search';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import BigchainDBMixin from '../../../lib/js/react/mixins/bigchaindb_mixin';


const OnTheRecord = React.createClass({

    mixins: [BigchainDBMixin],

    fetchAssetList({ accountToFetch, search }) {
        if (accountToFetch) {
            AssetActions.fetchAssetList({
                accountToFetch,
                search,
                blockWhenFetching: true
            });
            Scroll.animateScroll.scrollToBottom();
        }
    },

    handleAccountChangeAndScroll(account) {
        this.handleAccountChange(account);
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
        const {
            activeAccount,
            assetList,
            assetMeta
        } = this.state;

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
                                handleAccountClick={this.handleAccountChangeAndScroll} >
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
