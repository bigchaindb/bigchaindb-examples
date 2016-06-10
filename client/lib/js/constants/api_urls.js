/* eslint-disable prefer-template */
import { API_PATH } from './application_constants';


const ApiUrls = {
    'accounts': API_PATH + 'accounts/',
    'accounts_detail': API_PATH + 'accounts/%(accountId)s/',
    'assets_for_account': API_PATH + 'accounts/%(accountId)s/assets/',
    'assets': API_PATH + 'assets/',
    'assets_detail': API_PATH + 'assets/%(assetId)s/',
    'assets_transfer': API_PATH + 'assets/%(assetId)s/%(cid)s/transfer/',
    'assets_escrow': API_PATH + 'assets/%(assetId)s/%(cid)s/escrow/',
    'assets_escrow_fulfill': API_PATH + 'assets/%(assetId)s/%(cid)s/escrow/fulfill/'
};


export default ApiUrls;
