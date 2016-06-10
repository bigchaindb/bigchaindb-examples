import React from 'react';
import { safeInvoke } from 'js-utility-belt/es6';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import AssetActionPanel from '../../../lib/js/react/components/asset_action_panel';
import AssetDetail from '../../../lib/js/react/components/asset_detail';


const AssetRow = React.createClass({
    propTypes: {
        accountList: React.PropTypes.array,
        actionMap: React.PropTypes.object,
        activeAccount: React.PropTypes.object,
        asset: React.PropTypes.object,
        handleAccountClick: React.PropTypes.func,
        handleAssetClick: React.PropTypes.func,
        isActive: React.PropTypes.bool
    },

    getDefaultProps() {
        return {
            actionMap: {
                'single-owner': {
                    actionName: 'ESCROW',
                    actionMessage: 'Escrow asset to:',
                    selectAccounts: true
                },
                'multi-owner': {
                    actionName: 'FULFILL',
                    actionMessage: 'Fulfill asset:',
                    selectAccounts: false
                }
            }
        };
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

        safeInvoke(handleAssetClick, asset);
        safeInvoke(handleAccountClick, activeAccount);
    },

    handleClick(selectedAccount) {
        const {
            asset,
        } = this.props;

        if (asset.type === 'single-owner') {
            this.handleEscrow(selectedAccount);
        } else if (asset.type === 'multi-owner') {
            this.handleFulfill();
        }
    },

    handleFulfill() {
        const {
            asset,
            activeAccount
        } = this.props;

        const idToTransfer = {
            txid: asset.id,
            cid: 0
        };

        const payloadToPost = {
            source: activeAccount,
            to: activeAccount
        };

        AssetActions.fulfillEscrowAsset({
            idToTransfer,
            payloadToPost
        });

        this.setState({ inEscrow: true });
    },

    handleEscrow(selectedAccount) {
        const {
            asset,
            activeAccount
        } = this.props;

        const idToTransfer = {
            txid: asset.id,
            cid: 0
        };

        const payloadToPost = {
            source: activeAccount,
            to: selectedAccount
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
            actionMap,
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
                    actionMessage={actionMap[asset.type].actionMessage}
                    actionName={actionMap[asset.type].actionName}
                    activeAccount={activeAccount}
                    handleActionClick={this.handleClick}
                    selectAccounts={actionMap[asset.type].selectAccounts} />
            );
        }

        return (
            <div
                onClick={this.handleAssetClick}
                style={{ outline: 'none' }}
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
