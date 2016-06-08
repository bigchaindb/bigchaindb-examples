import alt from '../alt';

import AssetActions from '../actions/asset_actions';

import AssetSource from '../sources/asset_source';


class AssetStore {
    constructor() {
        this.asset = null;
        this.assetList = {};
        this.assetMeta = {
            err: null,
            isFetchingList: false,
            payloadToPost: null,
            idToFetch: null,
            idToTransfer: null,
            accountToFetch: null,
            search: null
        };
        this.bindActions(AssetActions);
        this.registerAsync(AssetSource);
    }

    onFetchAsset(idToFetch) {
        this.assetMeta.idToFetch = idToFetch;
        this.getInstance().lookupAsset();
    }

    onSuccessFetchAsset(asset) {
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
        if (!this.assetMeta.isFetchingList) {
            this.assetMeta.accountToFetch = accountToFetch;
            this.assetMeta.search = search;
            this.assetMeta.isFetchingList = true;
            this.getInstance().lookupAssetList();
        }
    }

    onSuccessFetchAssetList(assetList) {
        if (assetList) {
            const { assets } = assetList;
            const { accountToFetch } = this.assetMeta;
            if (accountToFetch && assets) {
                if (Object.keys(assets).indexOf('bigchain') > -1) {
                    this.assetList[accountToFetch] = assets.bigchain.concat(assets.backlog);
                } else if (accountToFetch === 'all') {
                    this.assetList[accountToFetch] = assets.filter((asset) => (
                        asset.transaction.data.payload.app === 'sharetrader'
                    ));
                }
            }

            this.assetMeta.err = null;
            this.assetMeta.accountToFetch = null;
        } else {
            this.assetMeta.err = new Error('Problem fetching the asset list');
        }
        this.assetMeta.isFetchingList = false;
    }
    
    onFlushAssetList(accountToFetch) {
        this.assetList[accountToFetch] = [];
        this.assetMeta.accountToFetch = null;
        this.assetMeta.search = null;
        this.assetMeta.isFetchingList = false;
    }

    onPostAsset(payloadToPost) {
        this.assetMeta.payloadToPost = payloadToPost;
        this.getInstance().postAsset();
    }

    onTransferAsset({ idToTransfer, payloadToPost }) {
        this.assetMeta.idToTransfer = idToTransfer;
        this.assetMeta.payloadToPost = payloadToPost;
        this.getInstance().transferAsset();
    }

    onEscrowAsset({ idToTransfer, payloadToPost }) {
        this.assetMeta.idToTransfer = idToTransfer;
        this.assetMeta.payloadToPost = payloadToPost;
        this.getInstance().escrowAsset();
    }

    onSuccessPostAsset(asset) {
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
        this.assetMeta.isFetchingList = false;
    }

    onErrorAsset(err) {
        this.assetMeta.err = err;
        this.assetMeta.isFetchingList = false;
    }
}

export default alt.createStore(AssetStore, 'AssetStore');
