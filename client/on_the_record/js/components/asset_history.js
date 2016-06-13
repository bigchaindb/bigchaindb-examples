import React from 'react';

import AssetDetail from '../../../lib/js/react/components/asset_detail';


const AssetHistory = ({
        assetList
    }) => {
    if (assetList.length === 0) {
        return (
            <div className="content-text">
                No messages found on BigchainDB. Start typing...
            </div>
        );
    }

    return (
        <div>
            {assetList
                .map(asset => (
                    // TODO: improve backlog identifier: asset.hasOwnProperty('assignee')
                    <AssetDetail
                        key={asset.id}
                        asset={asset}
                        inProcess={asset.hasOwnProperty('assignee')} />
                ))}
        </div>
    );
};

AssetHistory.propTypes = {
    assetList: React.PropTypes.array.isRequired
};

export default AssetHistory;
