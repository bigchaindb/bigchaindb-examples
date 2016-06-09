import React from 'react';
import classnames from 'classnames';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import AssetActionPanel from '../../../lib/js/react/components/asset_action_panel';
import AssetDetail from '../../../lib/js/react/components/asset_detail';


const AssetRow = React.createClass({
    propTypes: {
        accountList: React.PropTypes.array,
        active: React.PropTypes.bool,
        activeAccount: React.PropTypes.object,
        asset: React.PropTypes.object,
        assetClass: React.PropTypes.string,
        handleAssetClick: React.PropTypes.func
    },

    getInitialState() {
        return {
            selectedAccount: null,
            transfered: false
        };
    },

    setSelectedAccount(account) {
        this.setState({ selectedAccount: account });
    },

    handleAssetClick() {
        const { asset, handleAssetClick } = this.props;
        handleAssetClick(asset);
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
        const { asset, active, activeAccount, accountList, assetClass } = this.props;
        const { selectedAccount, transfered } = this.state;

        const { data: { payload: { content } } = {} } = asset.transaction;

        let actionsPanel = null;
        if (active && activeAccount && activeAccount.vk !== 'all' && accountList && !transfered) {
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
            <AssetDetail
                asset={asset}
                assetContent={content ? `Row: ${content.y + 1}, Col: ${content.x + 1}` : '-'}
                className={classnames(assetClass, { transfered, active: active && !transfered })}
                onClick={this.handleAssetClick}>
                {actionsPanel}
            </AssetDetail>
        );
    }
});

export default AssetRow;
