import React from 'react';

import { Row, Glyphicon } from 'react-bootstrap/lib';
import classnames from 'classnames';
import moment from 'moment';


const AssetDetail = React.createClass({
    propTypes: {
        asset: React.PropTypes.object.isRequired,
        assetContent: React.PropTypes.string,
        children: React.PropTypes.node,
        className: React.PropTypes.string,
        inProcess: React.PropTypes.bool,
        onClick: React.PropTypes.func
    },

    getAssetContent() {
        const {
            asset,
            assetContent
        } = this.props;

        if (assetContent) {
            return assetContent;
        }
        // TODO: Validate
        const { data: { payload: { content } } = {} } = asset.transaction;
        return content || '-';
    },

    render() {
        const {
            asset,
            children,
            className,
            inProcess,
            onClick
        } = this.props;

        const assetContent = this.getAssetContent();
        const validGlyph = inProcess ? <Glyphicon glyph="cog" /> : <Glyphicon glyph="ok" />;
        const timestamp =
            moment(parseInt(asset.transaction.timestamp, 10) * 1000).toDate().toGMTString();

        return (
            <Row onClick={onClick}>
                <div className={classnames('asset-container', className)}>
                    <div className="asset-container-id">
                        {asset.id}
                    </div>
                    <div className="asset-container-detail">
                        {assetContent}
                    </div>
                    <div className="asset-container-timestamp">
                        {`${timestamp}   `}{validGlyph}
                    </div>
                    {children}
                </div>
            </Row>
        );
    }
});

export default AssetDetail;
