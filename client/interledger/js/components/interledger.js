import React from 'react';

import { Navbar } from 'react-bootstrap/lib';

import AccountList from '../../../lib/js/react/components/account_list';
import AccountDetail from './account_detail';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import BigchainDBMixin from '../../../lib/js/react/mixins/bigchaindb_mixin';


const Interledger = React.createClass({

    mixins: [BigchainDBMixin],

    fetchAssetList({ accountToFetch }) {
        if (accountToFetch) {
            AssetActions.fetchAssetList({
                accountToFetch
            });
        }
    },

    render() {
        const {
            accountList,
            activeAccount,
            activeAsset,
            assetList
        } = this.state;

        return (
            <div>
                <Navbar fixedTop inverse>
                    <h1 style={{ textAlign: 'center', color: 'white' }}>Interledger</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="page-content-wrapper">
                        <div className="page-content">
                            <AccountList
                                activeAccount={activeAccount}
                                appName="interledger"
                                className="row"
                                handleAccountClick={this.handleAccountChange} >
                                <AccountDetail
                                    accountList={accountList}
                                    activeAsset={activeAsset}
                                    assetList={assetList}
                                    handleAssetClick={this.handleAssetChange} />
                            </AccountList>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default Interledger;
