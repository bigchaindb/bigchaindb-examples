/* eslint-disable prefer-template */
import { API_PATH } from './application_constants';


const ApiUrls = {
    'accounts': API_PATH + 'accounts/',
    'accounts_detail': API_PATH + 'accounts/${account_id}/',
    'assets_for_account': API_PATH + 'accounts/${account_id}/assets/',
    'assets': API_PATH + 'assets/',
    'assets_detail': API_PATH + 'assets/${asset_id}/${cid}/',
    'assets_transfer': API_PATH + 'assets/${asset_id}/${cid}/transfer/'
};


export default ApiUrls;
