import React from 'react';

import AssetDetail from '../../../lib/js/react/components/asset_detail';

const Assets = React.createClass({

    propTypes: {
        activeAccount: React.PropTypes.object,
        assetListForAccount: React.PropTypes.array
    },

    render() {
        const { assetListForAccount } = this.props;

        if (assetListForAccount && assetListForAccount.length) {
            return (
                <div>
                    {assetListForAccount
                        .sort((a, b) => a.transaction.timestamp - b.transaction.timestamp)
                        .map(asset => (
                            <AssetDetail
                                key={asset.id}
                                asset={asset} />
                        ))}
                </div>
            );
        } else {
            return (
                <div className="content-text">
                    No assets found in BigchainDB. Start trading...
                </div>
            );
        }
    }
});

export default Assets;
