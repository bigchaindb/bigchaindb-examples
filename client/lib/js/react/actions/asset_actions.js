import alt from '../alt';


class AssetActions {
    constructor() {
        this.generateActions(
            'flushAsset',
            'fetchAsset',
            'successFetchAsset',
            'transferAsset',
            'escrowAsset',
            'fulfillEscrowAsset',
            'flushAssetList',
            'fetchAssetList',
            'successFetchAssetList',
            'errorAsset',
            'postAsset',
            'successPostAsset'
        );
    }
}

export default alt.createActions(AssetActions);
