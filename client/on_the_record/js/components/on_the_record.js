import React from 'react';

import { Navbar } from 'react-bootstrap/lib';

import Scroll from 'react-scroll';

import AccountList from '../../../lib/js/react/components/account_list';
import AccountDetail from '../../../lib/js/react/components/account_detail';

import Assets from './assets';
import Search from '../../../lib/js/react/components/search';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import BigchainDBConnection from '../../../lib/js/react/components/bigchaindb_connection';


const OnTheRecord = React.createClass({
    propTypes: {
        // Injected through BigchainDBConnection
        activeAccount: React.PropTypes.object,
        assetList: React.PropTypes.object,
        assetMeta: React.PropTypes.object,
        handleAccountChange: React.PropTypes.func
    },

    getInitialState() {
        return {
            search: null
        };
    },

    fetchAssetList({ account, search }) {
        if (account) {
            AssetActions.fetchAssetList({
                account,
                search,
                blockWhenFetching: true
            });
            Scroll.animateScroll.scrollToBottom();
        }
    },

    handleAccountChangeAndScroll(account) {
        this.props.handleAccountChange(account);
        Scroll.animateScroll.scrollToBottom();
    },

    handleSearch(query) {
        const { activeAccount } = this.props;

        this.setState({
            search: query
        });

        this.fetchAssetList({
            account: activeAccount,
            search: query
        });
    },

    render() {
        const {
            activeAccount,
            assetList,
            assetMeta
        } = this.props;

        const assetListForAccount = (
            assetList && activeAccount && Array.isArray(assetList[activeAccount.vk])) ?
            assetList[activeAccount.vk] : null;

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
                                handleAccountClick={this.handleAccountChangeAndScroll}>
                                <AccountDetail />
                            </AccountList>
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <div className="page-content">
                            <Assets
                                activeAccount={activeAccount}
                                assetList={assetListForAccount} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});


export default BigchainDBConnection(OnTheRecord);
