import React from 'react';

import AssetDetail from '../../../lib/js/react/components/asset_detail';

import Spinner from '../../../lib/js/react/components/spinner';


const AssetHistory = ({
        activeAccount,
        assetList
    }) => {
    if (assetList && Array.isArray(assetList[activeAccount.vk])) {
        const assetListForAccount = assetList[activeAccount.vk];
        if (assetListForAccount.length) {
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
                    No messages found in BigchainDB. Start typing...
                </div>
            );
        }
    } else {
        return (
            <div style={{ margin: '2em' }}>
                <Spinner />
            </div>
        );
    }
};

AssetHistory.propTypes = {
    activeAccount: React.PropTypes.object,
    assetList: React.PropTypes.object
};

export default AssetHistory;
