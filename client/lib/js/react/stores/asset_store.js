'use strict';

import { alt } from '../alt';

import AssetActions from '../actions/asset_actions';

import AssetSource from '../sources/asset_source';


class AssetStore {
    constructor() {
        this.asset = null;
        this.assetList = null;
        this.assetMeta = {
            err: null,
            payloadToPost: null,
            idToFetch: null,
            idToTransfer: null,
            accountToFetch: null,
            search: null
        };
        this.bindActions( AssetActions );
        this.registerAsync( AssetSource );
    }

    onFetchAsset( idToFetch ) {
        this.assetMeta.idToFetch = idToFetch;
        this.getInstance().lookupAsset();
    }

    onSuccessFetchAsset( asset ) {
        if (asset) {
            this.asset = asset;
            this.assetMeta.err = null;
            this.assetMeta.idToFetch = null;
            this.assetMeta.search = null;
        } else {
            this.assetMeta.err = new Error('Problem fetching the asset');
        }
    }
    
    onFetchAssetList({ accountToFetch, search }) {
        this.assetMeta.accountToFetch = accountToFetch;
        this.assetMeta.search = search;
        this.getInstance().lookupAssetList();
    }

    onSuccessFetchAssetList( assetList ) {
        if ( assetList ) {
            if ( this.assetMeta.accountToFetch ) {
                assetList = assetList['assets'];
                if (assetList && Object.keys(assetList).indexOf('bigchain') > -1) {
                    this.assetList = assetList.bigchain.concat(assetList.backlog);
                }
            } else {
                this.assetList = assetList['assets'].filter(( asset ) => {
                    if (asset.transaction.data.payload.app == 'sharetrader'){
                        return asset;
                    }
                })
            }

            this.assetMeta.err = null;
            this.assetMeta.accountToFetch = null;
            this.assetMeta.search = null;
        } else {
            this.assetMeta.err = new Error('Problem fetching the asset list');
        }
    }

    onPostAsset(payloadToPost) {
        this.assetMeta.payloadToPost = payloadToPost;
        this.getInstance().postAsset();
    }


    onTransferAsset( {idToTransfer, payloadToPost} ) {
        this.assetMeta.idToTransfer = idToTransfer;
        this.assetMeta.payloadToPost = payloadToPost;
        this.getInstance().transferAsset();
    }

    onSuccessPostAsset( asset ) {
        if (asset) {
            this.asset = asset;
            this.assetMeta.err = null;
            this.assetMeta.idToTransfer = null;
            this.assetMeta.payloadToPost = null;
        } else {
            this.assetMeta.err = new Error('Problem posting to the asset');
        }
    }

    onFlushAsset() {
        this.asset = null;
        this.assetMeta.err = null;
        this.assetMeta.payloadToPost = null;
        this.assetMeta.idToFetch = null;
        this.assetMeta.search = null;
    }

    onErrorAsset(err) {
        this.assetMeta.err = err;
    }
}

export default alt.createStore(AssetStore, 'AssetStore');
