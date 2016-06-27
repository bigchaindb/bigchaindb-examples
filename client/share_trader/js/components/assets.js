import React from 'react';

import AssetRow from './asset_row';
import Spinner from '../../../lib/js/react/components/spinner';


const Assets = ({
    accountList,
    activeAccount,
    activeAsset,
    assetClasses,
    assetList,
    handleAssetClick
}) => {
    if (assetList && assetList.length) {
        // re-sorting assetList because assets of multiple accounts possible
        return (
            <div>
                {assetList.sort((a, b) => {
                    if (a.transaction.timestamp === b.transaction.timestamp) {
                        if (a.id < b.id) {
                            return -1;
                        } else {
                            return a.id > b.id ? 1 : 0;
                        }
                    }
                    return a.transaction.timestamp - b.transaction.timestamp;
                })
                    .map((asset) => {
                        const isActive = !!activeAsset && activeAsset.id === asset.id;
                        const assetClass = assetClasses[asset.transaction.conditions[0].new_owners[0]];

                        return (
                            <AssetRow
                                key={asset.id}
                                accountList={accountList}
                                activeAccount={activeAccount}
                                asset={asset}
                                assetClass={assetClass}
                                handleAssetClick={handleAssetClick}
                                isActive={isActive} />
                        );
                    })}
            </div>
        );
    } else {
        return (
            <div style={{ margin: '2em' }}>
                <Spinner />
            </div>
        );
    }
};

Assets.propTypes = {
    accountList: React.PropTypes.array,
    activeAccount: React.PropTypes.object,
    activeAsset: React.PropTypes.object,
    assetClasses: React.PropTypes.object,
    assetList: React.PropTypes.array,
    handleAssetClick: React.PropTypes.func
};

export default Assets;
