
import { safeMerge } from 'js-utility-belt/es6';

import AssetStore from '../stores/asset_store';
import AccountStore from '../stores/account_store';


const BigchainDBMixin = {
    getInitialState() {
        const accountStore = AccountStore.getState();
        const assetStore = AssetStore.getState();

        return safeMerge(
            {
                activeAccount: null,
                activeAsset: null
            },
            accountStore,
            assetStore
        );
    },

    componentDidMount() {
        AccountStore.listen(this.onAccountStoreChange);
        AssetStore.listen(this.onChange);
    },

    componentWillUnmount() {
        AccountStore.unlisten(this.onAccountStoreChange);
        AssetStore.unlisten(this.onChange);
    },

    onChange(state) {
        this.setState(state);
    },

    onAccountStoreChange(state) {
        const oldAccountList = this.state.accountList;
        state.accountList.forEach((account) => {
            if (account.ledger &&
                (!oldAccountList ||
                 (oldAccountList && oldAccountList.indexOf(account) === -1))) {
                account.ledger.on('incoming', this.handleLedgerChanges);
            }
        });

        this.setState(state);
    },

    handleAccountChange(account) {
        this.setState({
            activeAccount: account
        });
    },

    resetActiveAccount() {
        this.handleAccountChange(null);
    },

    handleLedgerChanges(changes) {
        console.log('incoming: ', changes);

        if (changes && changes.client) {
            this.fetchAssetList({
                accountToFetch: changes.client
            });
        }
    },

    handleAssetChange(asset) {
        this.setState({
            activeAsset: asset
        });
    }
};

export default BigchainDBMixin;
