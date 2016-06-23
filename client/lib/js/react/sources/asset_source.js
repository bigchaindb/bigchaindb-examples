    import request from '../../utils/request';

import AssetActions from '../actions/asset_actions';


const AssetSource = {

    lookupAsset: {
        remote(state) {
            return request('asset_detail', {
                urlTemplateSpec: {
                    assetId: state.assetMeta.idToFetch
                }
            });
        },

        success: AssetActions.successFetchAsset,
        error: AssetActions.errorAsset
    },

    lookupAssetList: {
        remote(state) {
            const { accountToFetch, search } = state.assetMeta;
            if (accountToFetch === null) {
                // fetch all assets
                return request('assets', {
                    query: { search }
                });
            } else {
                // fetch assets for account
                return request('assets_for_account', {
                    query: { search },
                    urlTemplateSpec: {
                        accountId: accountToFetch
                    }
                });
            }
        },

        success: AssetActions.successFetchAssetList,
        error: AssetActions.errorAsset
    },

    postAsset: {
        remote(state) {
            return request('assets', {
                method: 'POST',
                jsonBody: state.assetMeta.payloadToPost
            });
        },

        success: AssetActions.successPostAsset,
        error: AssetActions.errorAsset
    },

    transferAsset: {
        remote(state) {
            const { idToTransfer: { cid, txid: assetId }, payloadToPost } = state.assetMeta;

            return request('assets_transfer', {
                method: 'POST',
                jsonBody: payloadToPost,
                urlTemplateSpec: { assetId, cid }
            });
        },

        success: AssetActions.successPostAsset,
        error: AssetActions.errorAsset
    },

    escrowAsset: {
        remote(state) {
            const { idToTransfer: { cid, txid: assetId }, payloadToPost } = state.assetMeta;

            return request('assets_escrow', {
                method: 'POST',
                jsonBody: payloadToPost,
                urlTemplateSpec: { assetId, cid }
            });
        },

        success: AssetActions.successPostAsset,
        error: AssetActions.errorAsset
    },

    fulfillEscrowAsset: {
        remote(state) {
            const { idToTransfer: { cid, txid: assetId }, payloadToPost } = state.assetMeta;

            return request('assets_escrow_fulfill', {
                method: 'POST',
                jsonBody: payloadToPost,
                urlTemplateSpec: { assetId, cid }
            });
        },

        success: AssetActions.successPostAsset,
        error: AssetActions.errorAsset
    }

};

export default AssetSource;
