import request from '../../utils/request';

import AssetActions from '../actions/asset_actions';


const AssetSource = {

    lookupAssetList: {
        remote(state) {
            const { account, search } = state.assetMeta;
            // fetch assets for account
            const url = `${account.api}/accounts/${account.vk}/assets/`;
            return request(url, {
                query: { search }
            });
        },

        success: AssetActions.successFetchAssetList,
        error: AssetActions.errorAsset
    },

    postAsset: {
        remote(state) {
            const { account, payloadToPost } = state.assetMeta;
            const url = `${account.api}/assets/`;
            return request(url, {
                method: 'POST',
                jsonBody: payloadToPost
            });
        },

        success: AssetActions.successPostAsset,
        error: AssetActions.errorAsset
    },

    transferAsset: {
        remote(state) {
            const { account, idToTransfer: { cid, txid: assetId }, payloadToPost } = state.assetMeta;
            const url = `${account.api}/assets/${assetId}/${cid}/transfer/`;
            return request(url, {
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
