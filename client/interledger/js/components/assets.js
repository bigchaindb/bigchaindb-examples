import React from 'react';

import { Row, Glyphicon } from 'react-bootstrap/lib';

import Spinner from '../../../lib/js/react/components/spinner';


const Assets = React.createClass({

    propTypes: {
        activeAccount: React.PropTypes.object,
        assetListForAccount: React.PropTypes.array
    },
    
    render() {
        const { activeAccount, assetListForAccount } = this.props;
        
        return (
            <AssetHistory
                activeAccount={activeAccount}
                assetListForAccount={assetListForAccount} />
        );
    }
});


const AssetHistory = React.createClass({
    propTypes: {
        activeAccount: React.PropTypes.object,
        assetListForAccount: React.PropTypes.array
    },

    render() {
        const { activeAccount, assetListForAccount } = this.props;

        if (assetListForAccount && assetListForAccount.length) {
            return (
                <div>
                    {assetListForAccount
                        .sort((a, b) => a.transaction.timestamp - b.transaction.timestamp)
                        .map(asset => (
                            <AssetRow
                                key={asset.id}
                                asset={asset} />
                        ))}
                </div>
            );
        } else {
            return (
                <div className="content-text">
                    No messages found in BigchainDB. Start typing...
                </div>
            );
        }
    }
});


const AssetRow = React.createClass({
    propTypes: {
        asset: React.PropTypes.object
    },

    render() {
        const { asset } = this.props;
        const assetContent = asset.transaction.data ? asset.transaction.data.payload.content : '-';
        const validGlyph = asset.hasOwnProperty('assignee') ? <Glyphicon glyph="cog" />
                                                            : <Glyphicon glyph="ok" />;

        return (
            <Row>
                <div className="asset-container pull-right">
                    <div className="asset-container-id">
                        {asset.id}
                    </div>
                    <div className="asset-container-detail">
                        {assetContent}
                    </div>
                    <div className="asset-container-timestamp pull-right">
                        {new Date(parseInt(asset.transaction.timestamp, 10) * 1000).toGMTString() + '   '}
                        {validGlyph}
                    </div>
                </div>
            </Row>
        );
    }
});

export default Assets;
