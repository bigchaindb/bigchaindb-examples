import React from 'react';

import AssetDetail from '../../../lib/js/react/components/asset_detail';
import inBacklog from '../../../lib/js/utils/bigchaindb/in_backlog';


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
                    <AssetDetail
                        key={asset.id}
                        asset={asset}
                        className={'pull-right'}
                        inBacklog={inBacklog(asset)} />
                ))}
        </div>
    );
};

AssetHistory.propTypes = {
    assetList: React.PropTypes.array.isRequired
};

export default AssetHistory;
