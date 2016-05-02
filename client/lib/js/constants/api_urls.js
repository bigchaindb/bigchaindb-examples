'use strict';

import AppConstants from './application_constants';


let ApiUrls = {
    'accounts': AppConstants.apiEndpoint + 'accounts/',
    'accounts_detail': AppConstants.apiEndpoint + 'accounts/${account_id}',
    'assets': AppConstants.apiEndpoint + 'assets/',
    'assets_detail': AppConstants.apiEndpoint + 'assets/',
    'assets_transfer': AppConstants.apiEndpoint + 'assets/${asset_id}/transfer',
    'assets_for_account': AppConstants.apiEndpoint + 'accounts/${account_id}/assets/'
};


export default ApiUrls;
