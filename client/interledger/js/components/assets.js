import React from 'react';

import AssetRow from './asset_row';
import Spinner from '../../../lib/js/react/components/spinner';


const Assets = ({
        activeAccount,
        accountList,
        assetListForAccount,
        activeAsset,
        handleAccountClick,
        handleAssetClick
    }) => {
    if (assetListForAccount && assetListForAccount.length) {
        return (
            <div>
                {assetListForAccount.sort((a, b) => a.transaction.timestamp - b.transaction.timestamp)
                    .map((asset) => {
                        const active = (activeAsset) ? activeAsset.id === asset.id : false;

                        return (
                            <AssetRow
                                key={asset.id}
                                accountList={active ? accountList : null}
                                active={active}
                                activeAccount={active ? activeAccount : null}
                                asset={asset}
                                handleAccountClick={handleAccountClick}
                                handleAssetClick={handleAssetClick} />
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
    assetListForAccount: React.PropTypes.array,
    handleAccountClick: React.PropTypes.func,
    handleAssetClick: React.PropTypes.func
};

export default Assets;
