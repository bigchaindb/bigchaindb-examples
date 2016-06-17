import React from 'react';
import classnames from 'classnames';
import { safeInvoke } from 'js-utility-belt/es6';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import AssetActionPanel from '../../../lib/js/react/components/asset_action_panel';
import AssetDetail from '../../../lib/js/react/components/asset_detail';


const AssetRow = React.createClass({
    propTypes: {
        accountList: React.PropTypes.array,
        activeAccount: React.PropTypes.object,
        asset: React.PropTypes.object,
        assetClass: React.PropTypes.string,
        handleAssetClick: React.PropTypes.func,
        isActive: React.PropTypes.bool
    },

    getInitialState() {
        return {
            inTransfer: false
        };
    },

    handleAssetClick() {
        const {
            asset,
            handleAssetClick
        } = this.props;
        safeInvoke(handleAssetClick, asset);
    },

    handleTransferClick(selectedAccount) {
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

        AssetActions.transferAsset({
            idToTransfer,
            payloadToPost
        });

        this.setState({ inTransfer: true });
    },

    render() {
        const {
            asset,
            activeAccount,
            accountList,
            assetClass,
            isActive
        } = this.props;

        const {
            inTransfer
        } = this.state;

        const { data: { payload: { content } } = {} } = asset.transaction;

        let actionsPanel = null;
        if (isActive && activeAccount && accountList && !inTransfer) {
            actionsPanel = (
                <AssetActionPanel
                    accountList={accountList}
                    activeAccount={activeAccount}
                    handleActionClick={this.handleTransferClick} />
            );
        }

        return (
            <AssetDetail
                asset={asset}
                assetContent={content ? `Row: ${content.y + 1}, Col: ${content.x + 1}` : '-'}
                className={classnames(assetClass, { inTransfer, active: isActive && !inTransfer }, 'pull-right')}
                inBacklog={inTransfer}
                onClick={this.handleAssetClick}>
                {actionsPanel}
            </AssetDetail>
        );
    }
});

export default AssetRow;
