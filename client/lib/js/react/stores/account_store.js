import alt from '../alt';

import AccountActions from '../actions/account_actions';
import AccountSource from '../sources/account_source';

import AssetActions from '../actions/asset_actions';

import connectToBigchainDBLedger from '../../plugins/ledger_utils';


class AccountStore {
    constructor() {
        this.account = null;
        this.accountList = null;
        this.accountMeta = {
            err: null,
            payloadToPost: null,
            idToFetch: null,
            app: null
        };
        this.bindActions(AccountActions);
        this.registerAsync(AccountSource);
    }

    onFetchAccount(idToFetch) {
        this.accountMeta.idToFetch = idToFetch;
        this.getInstance().lookupAccount();
    }

    onSuccessFetchAccount(account) {
        if (account) {
            this.account = this.postProcessAccount(account);
            this.accountMeta.err = null;
            this.accountMeta.idToFetch = null;
            this.accountMeta.app = null;
        } else {
            this.accountMeta.err = new Error('Problem fetching the account');
        }
    }

    onFetchAccountList({ app }) {
        this.accountMeta.app = app;
        this.getInstance().lookupAccountList();
    }

    onSuccessFetchAccountList(accountList) {
        if (accountList) {
            this.accountList = accountList.accounts.map((account) => {
                return this.postProcessAccount(account);
            });
            this.accountMeta.err = null;
            this.accountMeta.app = null;
        } else {
            this.accountMeta.err = new Error('Problem fetching the account list');
        }
    }

    postProcessAccount(account) {
        account.ledger = connectToBigchainDBLedger(account);
        AssetActions.fetchAssetList.defer({
            accountToFetch: account
        });
        return account;
    }

    onPostAccount(payloadToPost) {
        this.accountMeta.payloadToPost = payloadToPost;
        this.getInstance().postAccount();
    }

    onSuccessPostAccount(account) {
        if (account) {
            this.account = account;
            this.accountMeta.err = null;
            this.accountMeta.payloadToPost = null;
            this.accountMeta.app = null;
        } else {
            this.accountMeta.err = new Error('Problem posting to the account');
        }
    }

    onFlushAccount() {
        this.account = null;
        this.accountMeta.err = null;
        this.accountMeta.payloadToPost = null;
        this.accountMeta.idToFetch = null;
        this.accountMeta.app = null;
    }

    onFlushAccountList() {
        this.accountList = null;
        this.accountMeta.err = null;
        this.accountMeta.app = null;
    }

    onErrorAccount(err) {
        this.accountMeta.err = err;
    }
}

export default alt.createStore(AccountStore, 'AccountStore');
