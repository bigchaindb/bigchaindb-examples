'use strict';

import React from 'react/';

import { History } from 'react-router/';

import { Row, Col, Button, Glyphicon } from 'react-bootstrap/lib/';

import AssetActions from '../actions/asset_actions';
import AssetStore from '../stores/asset_store';

import AscribeSpinner from '../spinner';


const Assets = React.createClass({

    propTypes: {
        activeAccount: React.PropTypes.object
    },

    getInitialState: function() {
        return {value: null};
    },

    postAsset(payload) {
        AssetActions.postAsset(payload);
    },

    handleInputSubmit(event){
        event.preventDefault();
        const { activeAccount } = this.props;
        const { value } = this.state;
        const payload = {
            to: activeAccount.vk,
            content: value
        };
        this.postAsset(payload)
        this.setState({value: null});
    },

    handleInputChange(event) {
        this.setState({value: event.target.value});
    },

    render() {
        const { activeAccount } = this.props;
        const { value } = this.state;

        return (
            <div>
                <AssetHistory activeAccount={activeAccount}/>
                <form onSubmit={this.handleInputSubmit}>
                    <input
                        className="navbar-fixed-bottom"
                        autoFocus placeholder="Type your reaction/emoji"
                        value={value}
                        onChange={this.handleInputChange}/>
                </form>
            </div>
        );
    }
});


const AssetHistory = React.createClass({
    propTypes: {
        activeAccount: React.PropTypes.object
    },

    getInitialState() {
        return AssetStore.getState();
    },

    componentDidMount() {
        AssetStore.listen(this.onChange);
        this.fetchAssetList();
    },

    componentWillUnmount() {
        AssetStore.unlisten(this.onChange);
    },

    fetchAssetList(){
        AssetActions.flushAssetList();
        const { activeAccount } = this.props;

        if ( activeAccount ) {
            AssetActions.fetchAssetList(activeAccount.vk);
        }
        setTimeout(this.fetchAssetList, 5000);
    },

    onChange(state) {
        this.setState(state);
    },

    render() {
        const { assetList } = this.state;

        if ( assetList && assetList.length > 0 ) {

            return (
                <div>
                    {
                        assetList.sort((a, b) => a.transaction.timestamp - b.transaction.timestamp)
                            .map(asset => {
                            return (
                                <AssetRow
                                    key={ asset.id }
                                    asset={ asset }/>
                            );
                        })
                    }
                </div>
            );
        }

        return (
            <div style={{margin: '2em'}}>
                <AscribeSpinner />
            </div>
        );
    }
});


const AssetRow = React.createClass({

    propTypes: {
        asset: React.PropTypes.object
    },

    render() {
        const { asset } = this.props;

        return (
            <Row>
                <div className='asset-container pull-right'>
                    <div className='asset-container-id'>
                        id: {asset.id}
                    </div>
                    <div className='asset-container-detail'>
                        {asset.transaction.data ?
                            asset.transaction.data.payload.content :
                            '-'
                        }
                    </div>
                    <div className='asset-container-timestamp pull-right'>
                        timestamp: {asset.transaction.timestamp}
                    </div>
                </div>
            </Row>
        );
    }
});

export default Assets;
