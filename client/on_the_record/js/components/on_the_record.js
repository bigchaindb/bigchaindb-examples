import React from 'react/';

import { Navbar } from 'react-bootstrap/lib/';

import Scroll from 'react-scroll';

import { safeMerge } from 'js-utility-belt/es6';
import { getScrollPosition } from 'js-utility-belt/es6/dom';

import Accounts from '../../../lib/js/react/components/accounts';
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
                searchQuery: null
            },
            assetStore
        );
    },

    componentDidMount() {
        AssetStore.listen(this.onChange);

        this.fetchAssetList();
        Scroll.animateScroll.scrollToBottom();
    },

    componentWillUnmount() {
        AssetStore.unlisten(this.onChange);
    },

    fetchAssetList() {
        AssetActions.flushAssetList();
        const { activeAccount, searchQuery } = this.state;
        const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (activeAccount) {
            AssetActions.fetchAssetList({ accountToFetch: activeAccount.vk, search: searchQuery });

            if (maxScroll - getScrollPosition().y < 40) {
                Scroll.animateScroll.scrollToBottom();
            }
        }
        setTimeout(this.fetchAssetList, 1000);
    },

    onChange(state) {
        this.setState(state);
    },

    setActiveAccount(account) {
        this.setState({
            activeAccount: account
        });
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
                            <Accounts
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
