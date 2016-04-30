'use strict';

import AppConstants from './application_constants';


let ApiUrls = {
    'accounts': AppConstants.apiEndpoint + 'accounts/',
    'accounts_detail': AppConstants.apiEndpoint + 'accounts/${account_id}',
    'assets': AppConstants.apiEndpoint + 'assets/',
    'asset_list': AppConstants.apiEndpoint + 'accounts/${account_id}/assets/'
};


export default ApiUrls;
