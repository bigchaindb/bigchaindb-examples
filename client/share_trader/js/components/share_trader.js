'use strict';

import React from 'react/';

import {Navbar, Row, Col, Button } from 'react-bootstrap/lib/';

import Scroll from 'react-scroll';

import Accounts from './accounts';
import Assets from './assets';
import Search from '../../../lib/js/react/components/search';
import AssetMatrix from './asset_matrix';

import AssetActions from '../../../lib/js/react/actions/asset_actions';
import AssetStore from '../../../lib/js/react/stores/asset_store';

import AccountStore from '../../../lib/js/react/stores/account_store';

import { mergeOptions } from '../../../lib/js/utils/general_utils';


const ShareTrader = React.createClass({

    getInitialState() {
        const assetStore = AssetStore.getState();
        const accountStore = AccountStore.getState();

        return mergeOptions(
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
        AssetStore.listen( this.onChange );
        AccountStore.listen( this.onChange );

        this.fetchAssetList();
        Scroll.animateScroll.scrollToBottom();
    },

    componentWillUnmount() {
        AssetStore.unlisten( this.onChange );
        AccountStore.unlisten( this.onChange );
    },

    onChange( state ) {
        this.setState( state );
    },

    setActiveAccount( account ){
        this.setState({
            activeAccount: account
        });
    },

    resetActiveAccount(){
        this.setState({
            activeAccount: null
        });
    },

    setActiveAsset( asset ){
        this.setState({
            activeAsset: asset
        });
    },
    
    mapAccountsOnStates( accountList ) {
        let states = {'default': 'available'};
        if (!accountList) {
            return states;
        }
        for (let i = 0; i < accountList.length; i++){
            states[accountList[i].vk] = 'state' + i;
        }
        return states;
    },

    fetchAssetList(){
        AssetActions.flushAssetList();
        const { activeAccount, searchQuery } = this.state;
        const accountPublicKey = activeAccount ? activeAccount.vk : null;

        AssetActions.fetchAssetList({ accountToFetch: accountPublicKey, search: searchQuery });

        setTimeout(this.fetchAssetList, 1000);
    },

    handleSearch( query ){
        this.setState({
            searchQuery: query
        });
    },

    render() {
        const { activeAccount, accountList, activeAsset, assetList, assetMeta } = this.state;
        const states = this.mapAccountsOnStates( accountList );

        return (
            <div>
                <Navbar inverse fixedTop>
                    <h1 style={{ textAlign: 'center', color: 'white' }}>Share Trader</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <Search
                                initialQuery={ assetMeta.search }
                                handleSearch={ this.handleSearch }/>
                            <div style={{textAlign: 'center'}}>
                                <Button
                                    onClick={ this.resetActiveAccount }>
                                    Select All
                                </Button>
                            </div>
                            <Accounts
                                activeAccount={ activeAccount }
                                handleAccountClick={ this.setActiveAccount }/>
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <div className="page-content">
                            <Row>
                                <Col xs={ 6 } md={ 8 } className="asset-matrix">
                                    <div className="vertical-align-outer">
                                        <div className="vertical-align-inner">
                                            <AssetMatrix
                                                rows={ 8 }
                                                cols={ 8 }
                                                states={ states }
                                                handleAssetClick={ this.setActiveAsset }/>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={ 6 } md={ 4 } className="asset-history">
                                    <Assets
                                        activeAccount={ activeAccount }
                                        accountList={ accountList }
                                        activeAsset={ activeAsset }
                                        assetList={ assetList }
                                        assetClasses={ states }
                                        handleAssetClick={ this.setActiveAsset }/>
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