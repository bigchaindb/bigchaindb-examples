import React from 'react';

import AssetRow from './asset_row';
import Spinner from '../../../lib/js/react/components/spinner';


const Assets = ({
        account,
        accountList,
        assetList,
        activeAsset,
        handleAccountClick,
        handleAssetClick
    }) => {
    if (assetList && assetList.length) {
        return (
            <div>
                {assetList.map((asset) => {
                    const isActive = !!activeAsset && activeAsset.id === asset.id;

                    return (
                        <AssetRow
                            key={asset.id}
                            account={account}
                            accountList={accountList}
                            asset={asset}
                            handleAccountClick={handleAccountClick}
                            handleAssetClick={handleAssetClick}
                            isActive={isActive}/>
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
    account: React.PropTypes.object,
    accountList: React.PropTypes.array,
    activeAsset: React.PropTypes.object,
    assetClasses: React.PropTypes.object,
    assetList: React.PropTypes.array,
    handleAccountClick: React.PropTypes.func,
    handleAssetClick: React.PropTypes.func
};

export default Assets;
