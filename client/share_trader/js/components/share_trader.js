import React from 'react';
import { Navbar, Row, Col, Button } from 'react-bootstrap/lib';

import AccountList from '../../../lib/js/react/components/account_list';
import AccountDetail from '../../../lib/js/react/components/account_detail';

import Assets from './assets';
import AssetMatrix from './asset_matrix';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import BigchainDBMixin from '../../../lib/js/react/mixins/bigchaindb_mixin';


const ShareTrader = React.createClass({

    mixins: [BigchainDBMixin],

    fetchAssetList({ accountToFetch }) {
        AssetActions.fetchAssetList({
            accountToFetch,
            blockWhenFetching: false
        });
    },

    mapAccountsOnStates(accountList) {
        const states = {
            'default': 'available'
        };

        if (!accountList) {
            return states;
        }

        for (let i = 0; i < accountList.length; i++) {
            states[accountList[i].vk] = `state${i}`;
        }

        return states;
    },

    flattenAssetList(assetList) {
        return [].concat(...Object.values(assetList));
    },

    render() {
        const {
            activeAccount,
            accountList,
            activeAsset,
            assetList
        } = this.state;

        const states = this.mapAccountsOnStates(accountList);
        const assetListForAccount =
            activeAccount && assetList.hasOwnProperty(activeAccount.vk) ?
                assetList[activeAccount.vk] : this.flattenAssetList(assetList);

        return (
            <div>
                <Navbar fixedTop inverse>
                    <h1 style={{ textAlign: 'center', color: 'white' }}>Share Trader</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <div style={{ textAlign: 'center' }}>
                                <Button
                                    onClick={this.resetActiveAccount}>
                                    Select All
                                </Button>
                            </div>
                            <br />
                            <AccountList
                                activeAccount={activeAccount}
                                appName="sharetrader"
                                handleAccountClick={this.handleAccountChange}>
                                <AccountDetail />
                            </AccountList>
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <div className="page-content">
                            <Row>
                                <Col className="asset-matrix" md={8} xs={6}>
                                    <div className="vertical-align-outer">
                                        <div className="vertical-align-inner">
                                            <AssetMatrix
                                                assetList={assetListForAccount}
                                                cols={8}
                                                handleAssetClick={this.handleAssetChange}
                                                rows={8}
                                                states={states} />
                                        </div>
                                    </div>
                                </Col>
                                <Col className="asset-history" md={4} xs={6}>
                                    <Assets
                                        accountList={accountList}
                                        activeAccount={activeAccount}
                                        activeAsset={activeAsset}
                                        assetClasses={states}
                                        assetList={assetListForAccount}
                                        handleAssetClick={this.handleAssetChange} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default ShareTrader;
