import React from 'react';

import AssetRow from './asset_row';
import Spinner from '../../../lib/js/react/components/spinner';


export default function Assets(props) {
    const {
        activeAccount,
        accountList,
        assetList,
        activeAsset,
        assetClasses,
        handleAssetClick
    } = props;

    if (assetList && assetList.length) {
        return (
            <div>
                {assetList.sort((a, b) => a.transaction.timestamp - b.transaction.timestamp)
                    .map((asset) => {
                        const active = (activeAsset) ? activeAsset.id === asset.id : false;
                        const assetClass = assetClasses[asset.transaction.conditions[0]
                                               .new_owners[0]];
                        return (
                            <AssetRow
                                key={asset.id}
                                accountList={active ? accountList : null}
                                active={active}
                                activeAccount={active ? activeAccount : null}
                                asset={asset}
                                assetClass={assetClass}
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
}

Assets.propTypes = {
    accountList: React.PropTypes.array,
    activeAccount: React.PropTypes.object,
    activeAsset: React.PropTypes.object,
    assetClasses: React.PropTypes.object,
    assetList: React.PropTypes.oneOfType([
        React.PropTypes.object,
        React.PropTypes.array
    ]),
    handleAssetClick: React.PropTypes.func
};
