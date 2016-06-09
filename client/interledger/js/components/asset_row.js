import React from 'react';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import AssetActionPanel from '../../../lib/js/react/components/asset_action_panel';
import AssetDetail from '../../../lib/js/react/components/asset_detail';


const AssetRow = React.createClass({
    propTypes: {
        accountList: React.PropTypes.array,
        active: React.PropTypes.bool,
        activeAccount: React.PropTypes.object,
        asset: React.PropTypes.object,
        handleAccountClick: React.PropTypes.func,
        handleAssetClick: React.PropTypes.func
    },

    getInitialState() {
        return {
            selectedAccount: null,
            transfered: false
        };
    },

    setSelectedAccount(account) {
        this.setState({
            selectedAccount: account
        });
    },

    handleAssetClick() {
        const {
            activeAccount,
            handleAccountClick,
            asset,
            handleAssetClick
        } = this.props;

        handleAssetClick(asset);
        handleAccountClick(activeAccount);
    },

    handleTransferClick() {
        const { asset, activeAccount } = this.props;
        const { selectedAccount } = this.state;

        const idToTransfer = {
            txid: asset.id,
            cid: 0
        };

        const payloadToPost = {
            'source': activeAccount,
            'to': selectedAccount
        };

        AssetActions.transferAsset({
            idToTransfer,
            payloadToPost
        });

        this.setState({ transfered: true });
    },

    render() {
        const {
            asset,
            active,
            activeAccount,
            accountList,
        } = this.props;

        const {
            selectedAccount,
            transfered
        } = this.state;


        let actionsPanel = null;
        if (active && activeAccount && accountList && !transfered) {
            actionsPanel = (
                <AssetActionPanel
                    accountList={accountList}
                    activeAccount={activeAccount}
                    handleAccountClick={this.setSelectedAccount}
                    handleTransferClick={this.handleTransferClick}
                    selectedAccount={selectedAccount} />
            );
        }

        return (
            <div
                onClick={this.handleAssetClick}
                tabIndex={0}>
                <AssetDetail
                    asset={asset}>
                    {actionsPanel}
                </AssetDetail>
            </div>
        );
    }
});

export default AssetRow;
