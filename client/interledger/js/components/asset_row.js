import React from 'react';
import { safeInvoke } from 'js-utility-belt/es6';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import AssetActionPanel from '../../../lib/js/react/components/asset_action_panel';
import AssetDetail from '../../../lib/js/react/components/asset_detail';


const AssetRow = React.createClass({
    propTypes: {
        accountList: React.PropTypes.array,
        activeAccount: React.PropTypes.object,
        asset: React.PropTypes.object,
        handleAccountClick: React.PropTypes.func,
        handleAssetClick: React.PropTypes.func,
        isActive: React.PropTypes.bool
    },

    getInitialState() {
        return {
            inEscrow: false
        };
    },

    handleAssetClick() {
        const {
            activeAccount,
            handleAccountClick,
            asset,
            handleAssetClick
        } = this.props;

        safeInvoke(handleAssetClick(asset));
        safeInvoke(handleAccountClick(activeAccount));
    },

    handleEscrowClick(selectedAccount) {
        const {
            asset,
            activeAccount
        } = this.props;
        
        const idToTransfer = {
            txid: asset.id,
            cid: 0
        };

        const payloadToPost = {
            'source': activeAccount,
            'to': selectedAccount
        };

        AssetActions.escrowAsset({
            idToTransfer,
            payloadToPost
        });

        this.setState({ inEscrow: true });
    },

    render() {
        const {
            accountList,
            activeAccount,
            asset,
            isActive
        } = this.props;

        const {
            inEscrow
        } = this.state;


        let actionsPanel = null;
        if (isActive && activeAccount && accountList && !inEscrow) {
            actionsPanel = (
                <AssetActionPanel
                    accountList={accountList}
                    actionName="ESCROW"
                    activeAccount={activeAccount}
                    handleActionClick={this.handleEscrowClick} />
            );
        }

        return (
            <div
                onClick={this.handleAssetClick}
                tabIndex={0}>
                <AssetDetail
                    asset={asset}
                    inProcess={inEscrow}>
                    {actionsPanel}
                </AssetDetail>
            </div>
        );
    }
});

export default AssetRow;
