import React from 'react';

import AssetDetail from '../../../lib/js/react/components/asset_detail';


export default function Assets(props) {
    const {
        assetListForAccount
    } = props;

    if (assetListForAccount && assetListForAccount.length) {
        return (
            <div>
                {assetListForAccount
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


Assets.propTypes = {
    activeAccount: React.PropTypes.object,
    assetListForAccount: React.PropTypes.array
};
