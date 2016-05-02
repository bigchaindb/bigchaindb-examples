'use strict';

import React from 'react/';

import { Row, Col, Button, Glyphicon } from 'react-bootstrap/lib/';

import Scroll from 'react-scroll';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import AscribeSpinner from '../../../lib/js/react/components/spinner';


const Assets = React.createClass({

    propTypes: {
        assetList: React.PropTypes.object,
        activeAccount: React.PropTypes.object
    },

    getInitialState() {
        return { value: null };
    },

    componentDidUpdate() {
        let objDiv = this.getDOMNode()
        objDiv.scrollTop = objDiv.scrollHeight;
    },

    postAsset(payload) {
        AssetActions.postAsset(payload);
    },
    
    render() {
        const { assetList } = this.props;

        return (
            <div>
                <AssetHistory assetList={ assetList }/>
            </div>
        );
    }
});


const AssetHistory = React.createClass({
    propTypes: {
        assetList: React.PropTypes.object
    },

    render() {
        let { assetList } = this.props;
        assetList = assetList ? assetList.bigchain.concat(assetList.backlog) : assetList;

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
        else if ( assetList && assetList.length == 0 ) {

            return (
                <div className='content-text'>
                    No messages found on BigchainDB. Start typing...
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

        const inBacklog = 'assignee' in asset;
        const data = asset.transaction.data;

        let validGlyph = inBacklog ? <Glyphicon glyph="cog"/> : <Glyphicon glyph="ok"/>;
        return (
            <Row>
                <div className='asset-container'>
                    <div className='asset-container-id'>
                        { asset.id }
                    </div>
                    <div className='asset-container-detail'>
                        {  data ? data.payload.content.x + ',' + data.payload.content.y :
                            '-'
                        }
                    </div>
                    <div className='asset-container-timestamp'>
                        { new Date(parseInt(asset.transaction.timestamp, 10)*1000).toGMTString() + '   ' }
                        { validGlyph }
                    </div>
                </div>
            </Row>
        );
    }
});

export default Assets;
