'use strict';

import requests from '../../utils/requests';

import AssetActions from '../actions/asset_actions';


const AssetSource = {

    lookupAsset: {
        remote(state) {
            return requests.get('asset_detail',
                {asset_id: state.assetMeta.idToFetch}
            );
        },

        success: AssetActions.successFetchAsset,
        error: AssetActions.errorAsset
    },
    
    lookupAssetList: {
        remote(state) {
            if (state.assetMeta.accountToFetch) {
                return requests.get('assets_for_account',
                    {
                        account_id: state.assetMeta.accountToFetch,
                        search: state.assetMeta.search
                    });
            }
            else {
                return requests.get('assets',
                    {search: state.assetMeta.search});
            }
        },

        success: AssetActions.successFetchAssetList,
        error: AssetActions.errorAsset
    },

    postAsset: {
        remote(state) {
            return requests.post('assets',
                {body: state.assetMeta.payloadToPost}
            );
        },

        success: AssetActions.successPostAsset,
        error: AssetActions.errorAsset
    },
    
    transferAsset: {
        remote(state) {
            return requests.post('assets_transfer',
                {
                        asset_id: state.assetMeta.idToTransfer.txid,
                        cid: state.assetMeta.idToTransfer.cid,
                        body: state.assetMeta.payloadToPost
                }
            );
        },

        success: AssetActions.successPostAsset,
        error: AssetActions.errorAsset
    }
    
};

export default AssetSource;
