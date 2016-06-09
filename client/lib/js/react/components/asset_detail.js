import React from 'react';

import { Row, Glyphicon } from 'react-bootstrap/lib';
import classnames from 'classnames';


const AssetDetail = React.createClass({
    propTypes: {
        asset: React.PropTypes.object,
        assetContent: React.PropTypes.string,
        children: React.PropTypes.oneOfType([
            React.PropTypes.arrayOf(React.PropTypes.node),
            React.PropTypes.node
        ]),
        className: React.PropTypes.string
    },

    getDefaultProps() {
        return {
            className: 'pull-right'
        };
    },

    getAssetContent() {
        const { asset, assetContent } = this.props;
        if (!assetContent) {
            return asset.transaction.data ? asset.transaction.data.payload.content : '-';
        } else {
            return assetContent;
        }
    },

    render() {
        const {
            asset,
            children,
            className
        } = this.props;

        const assetContent = this.getAssetContent();
        const validGlyph = asset.hasOwnProperty('assignee') ? <Glyphicon glyph="cog" />
                                                            : <Glyphicon glyph="ok" />;
        const timestamp = new Date(parseInt(asset.transaction.timestamp, 10) * 1000).toGMTString();

        return (
            <Row>
                <div className={classnames('asset-container', className)}>
                    <div className="asset-container-id">
                        {asset.id}
                    </div>
                    <div className="asset-container-detail">
                        {assetContent}
                    </div>
                    <div className="asset-container-timestamp pull-right">
                        {`${timestamp}   `}{validGlyph}
                    </div>
                    {children}
                </div>
            </Row>
        );
    }
});

export default AssetDetail;
