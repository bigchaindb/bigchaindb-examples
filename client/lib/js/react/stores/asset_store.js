import { safeMerge } from 'js-utility-belt/es6';
import alt from '../alt';

import parseEscrowData from '../../utils/cryptoconditions/parse_escrow_data';

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
            account_: null,
            search: null
        };
        this.bindActions(AssetActions);
        this.registerAsync(AssetSource);
    }

    onFetchAssetList({ account, search, blockWhenFetching }) {
        if (!blockWhenFetching ||
            (blockWhenFetching && !this.assetMeta.isFetchingList)) {
            this.assetMeta.account = account;
            this.assetMeta.search = search;
            this.assetMeta.isFetchingList = true;
            this.getInstance().lookupAssetList();
        }
    }

    onSuccessFetchAssetList(assetList) {
        if (assetList) {
            const { assets, account } = assetList;
            if (account && assets) {
                if (assets.hasOwnProperty('bigchain')) {
                    this.assetList[account] =
                        assets.bigchain
                            .concat(assets.backlog)
                            .map(this.postProcessAsset)
                            .sort((a, b) => a.transaction.timestamp - b.transaction.timestamp);
                }
            }
            this.assetMeta.err = null;
            this.assetMeta.account = null;
        } else {
            this.assetMeta.err = new Error('Problem fetching the asset list');
        }
        this.assetMeta.isFetchingList = false;
    }

    postProcessAsset(asset) {
        const condition = asset.transaction.conditions[0].condition;

        if (Array.isArray(condition.details.subfulfillments)) {
            asset.type = 'multi-owner';
            return safeMerge(
                asset,
                parseEscrowData(condition.details)
            );
        } else {
            asset.type = 'single-owner';
        }

        return asset;
    }

    onFlushAssetList(account) {
        this.assetList[account] = [];
        this.assetMeta.account = null;
        this.assetMeta.search = null;
        this.assetMeta.isFetchingList = false;
    }

    onPostAsset({ account, payloadToPost }) {
        this.assetMeta.account = account;
        this.assetMeta.payloadToPost = payloadToPost;
        this.getInstance().postAsset();
    }

    onTransferAsset({ account, idToTransfer, payloadToPost }) {
        this.assetMeta.account = account;
        this.assetMeta.idToTransfer = idToTransfer;
        this.assetMeta.payloadToPost = payloadToPost;
        this.getInstance().transferAsset();
    }

    onEscrowAsset({ idToTransfer, payloadToPost }) {
        this.assetMeta.idToTransfer = idToTransfer;
        this.assetMeta.payloadToPost = payloadToPost;
        this.getInstance().escrowAsset();
    }

    onFulfillEscrowAsset({ idToTransfer, payloadToPost }) {
        this.assetMeta.idToTransfer = idToTransfer;
        this.assetMeta.payloadToPost = payloadToPost;
        this.getInstance().fulfillEscrowAsset();
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
