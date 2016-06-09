import React from 'react';

import AssetDetail from '../../../lib/js/react/components/asset_detail';

import Spinner from '../../../lib/js/react/components/spinner';


export default function AssetHistory(props) {
    const {
        activeAccount,
        assetList
    } = props;

    if (assetList && Object.keys(assetList).indexOf(activeAccount.vk) > -1) {
        const assetListForAccount = assetList[activeAccount.vk];
        if (assetListForAccount.length) {
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
}

AssetHistory.propTypes = {
    activeAccount: React.PropTypes.object,
    assetList: React.PropTypes.object
};
