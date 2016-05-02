'use strict';

import React from 'react/';

import {Navbar, Row, Col } from 'react-bootstrap/lib/';

import Scroll from 'react-scroll';

import Accounts from './accounts';
import Assets from './assets';
import Search from '../../../lib/js/react/components/search';
import AssetMatrix from './asset_matrix';

import AssetActions from '../../../lib/js/react/actions/asset_actions';
import AssetStore from '../../../lib/js/react/stores/asset_store';

import { mergeOptions, currentPositionY } from '../../../lib/js/utils/general_utils';


const ShareTrade = React.createClass({

    getInitialState() {
        const assetStore = AssetStore.getState();

        return mergeOptions(
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

    fetchAssetList(){
        AssetActions.flushAssetList();
        const { activeAccount, searchQuery } = this.state;
        if ( activeAccount ) {
            AssetActions.fetchAssetList({ accountToFetch: activeAccount.vk, search: searchQuery });
        }
        setTimeout(this.fetchAssetList, 1000);
    },

    initializeMatrix(rows, cols) {
        let matrix = new Array(cols);
        for (let i = 0; i < rows; i++) {
          matrix[i] = new Array(cols);
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = '0';
            }
        }
        return matrix
    },

    mapAssetsOnMatrix(assetList) {
        console.log('start mapping')
        let matrix = this.initializeMatrix(8, 8);
        let assetListContent = this.getAssetListContent(assetList);
        for (let content of assetListContent) {
            matrix[content.y][content.x] = '1';
        }
        console.log('stop mapping')
        return matrix
    },


    getAssetListContent(assetList) {
        if (!assetList) {
            return [];
        }
        assetList = assetList.bigchain.concat(assetList.backlog);

        return assetList.map(( asset ) => {
            return asset.transaction.data.payload.content;
        });
    },


    onChange(state) {
        this.setState(state);
    },

    setActiveAccount(account){
        this.setState({
            activeAccount: account
        });
    },

    handleSearch(query){
        this.setState({
            searchQuery: query
        });
    },

    render() {
        const { activeAccount, assetList, assetMeta } = this.state;

        let content = (
            <div className='content-text'>
                Select account from the list...
            </div>
        );

        if ( activeAccount ) {
            content = (
                <Assets
                    assetList={ assetList }
                    activeAccount={ activeAccount }/>
            );
        }

        return (
            <div>
                <Navbar inverse fixedTop>
                    <h1 style={{ textAlign: 'center', color: 'white' }}>"Share Trade"</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <Search
                                initialQuery={ assetMeta.search }
                                handleSearch={ this.handleSearch }/>
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
                                                matrix={ this.mapAssetsOnMatrix(assetList) }/>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={ 6 } md={ 4 } className="asset-history">
                                    { content }
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default ShareTrade;