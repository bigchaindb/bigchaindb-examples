'use strict';

import AppConstants from './application_constants';


let ApiUrls = {
    'accounts': AppConstants.apiEndpoint + 'accounts/',
    'accounts_detail': AppConstants.apiEndpoint + 'accounts/${account_id}/',
    'assets_for_account': AppConstants.apiEndpoint + 'accounts/${account_id}/assets/',
    'assets': AppConstants.apiEndpoint + 'assets/',
    'assets_detail': AppConstants.apiEndpoint + 'assets/${asset_id}/${cid}/',
    'assets_transfer': AppConstants.apiEndpoint + 'assets/${asset_id}/${cid}/transfer/'
};


export default ApiUrls;
