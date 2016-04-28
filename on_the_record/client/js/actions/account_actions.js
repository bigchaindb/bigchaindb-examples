'use strict';

import { alt } from '../alt';


class AccountActions {
    constructor() {
        this.generateActions(
            'flushAccount',
            'fetchAccount',
            'successFetchAccount',
            'flushAccountList',
            'fetchAccountList',
            'successFetchAccountList',
            'errorAccount',
            'postAccount',
            'successPostAccount'
        );
    }
}

export default alt.createActions(AccountActions);
