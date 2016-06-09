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
        onClick: React.PropTypes.func
    },

    getDefaultProps() {
        return {
            className: 'pull-right'
        };
    },

    getAssetContent() {
        const { asset, assetContent } = this.props;

        if (assetContent) {
            return assetContent;
        }

        const { data: { payload: { content } } = {} } = asset.transaction;
        return content || '-';
    },

    isAssetInBacklog(asset) {
        /*
        Currently we discriminate if an asset is in the
        backlog or bigchain by checking the assignee field.
        TODO: have bigchain and backlog keys in assetList
        */
        return asset.hasOwnProperty('assignee');
    },

    render() {
        const {
            asset,
            children,
            className,
            onClick
        } = this.props;

        const assetContent = this.getAssetContent();
        const validGlyph = this.isAssetInBacklog(asset) ? <Glyphicon glyph="cog" />
                                                        : <Glyphicon glyph="ok" />;
        const timestamp = moment(parseInt(asset.transaction.timestamp, 10) * 1000)
            .toDate().toGMTString();

        return (
            <Row onClick={onClick}>
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
