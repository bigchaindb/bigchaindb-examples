import AccountActions from '../actions/account_actions';

import request from '../../utils/request';


const AccountSource = {
    lookupAccount: {
        remote(state) {
            return request('accounts_detail', {
                urlTemplateSpec: {
                    accountId: state.accountMeta.idToFetch
                }
            });
        },

        success: AccountActions.successFetchAccount,
        error: AccountActions.errorAccount
    },

    lookupAccountList: {
        remote(state) {
            return request('accounts', {
                query: {
                    app: state.accountMeta.app
                }
            });
        },

        success: AccountActions.successFetchAccountList,
        error: AccountActions.errorAccount
    },

    postAccount: {
        remote(state) {
            return request('accounts', {
                method: 'POST',
                jsonBody: state.accountMeta.payloadToPost
            });
        },

        success: AccountActions.successPostAccount,
        error: AccountActions.errorAccount
    }
};

export default AccountSource;
