import requests from '../../utils/requests';

import AccountActions from '../actions/account_actions';


const AccountSource = {

    lookupAccount: {
        remote(state) {
            return requests.get('accounts_detail', {
                account_id: state.accountMeta.idToFetch
            });
        },

        success: AccountActions.successFetchAccount,
        error: AccountActions.errorAccount
    },

    lookupAccountList: {
        remote(state) {
            return requests.get('accounts', {
                app: state.accountMeta.app
            });
        },

        success: AccountActions.successFetchAccountList,
        error: AccountActions.errorAccount
    },

    postAccount: {
        remote(state) {
            return requests.post('accounts', {
                body: state.accountMeta.payloadToPost
            });
        },

        success: AccountActions.successPostAccount,
        error: AccountActions.errorAccount
    }
};

export default AccountSource;
