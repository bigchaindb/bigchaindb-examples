import React from 'react';

import { safeInvoke, safeMerge } from 'js-utility-belt/es6';

import AssetStore from '../stores/asset_store';
import AccountStore from '../stores/account_store';


export default function BigchainDBConnection(Component) {
    return React.createClass({
        displayName: `BigchainDBConnection(${Component.displayName || Component})`,

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
            const { oldAccountList } = this.state;
            state.accountList.forEach((account) => {
                if (account.ledger &&
                    (!oldAccountList ||
                     (oldAccountList && oldAccountList.indexOf(account) === -1))) {
                    account.ledger.on('incoming', this.handleLedgerChanges);
                }
            });

            this.setState(state);
        },

        handleAccountChange(activeAccount) {
            this.setState({
                activeAccount
            });
        },

        handleLedgerChanges(changes) {
            console.log('incoming: ', changes);

            if (changes && changes.client && this.refs.component) {
                const {
                    accountList
                } = this.state;

                const account = accountList.filter((account) => account.vk === changes.client)[0];
                safeInvoke(this.refs.component.fetchAssetList, {
                    account
                });
            }
        },

        handleAssetChange(asset) {
            this.setState({
                activeAsset: asset
            });
        },

        resetActiveAccount() {
            this.handleAccountChange(null);
        },

        render() {
            return (
                <Component
                    ref="component"
                    {...this.state}
                    handleAccountChange={this.handleAccountChange}
                    handleAssetChange={this.handleAssetChange}
                    resetActiveAccount={this.resetActiveAccount} />
            );
        }
    });
}
