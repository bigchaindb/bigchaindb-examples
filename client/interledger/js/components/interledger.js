import React from 'react';

import { Navbar } from 'react-bootstrap/lib';

import { safeMerge } from 'js-utility-belt/es6';

import AccountList from '../../../lib/js/react/components/accounts';
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
        const { activeAccount, assetList } = this.state;

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
                                    assetList={assetList} />
                            </AccountList>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default Interledger;
