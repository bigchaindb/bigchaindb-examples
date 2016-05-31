import React from 'react/';
import classNames from 'classnames';

import { Row, Button, Glyphicon, DropdownButton, MenuItem } from 'react-bootstrap/lib/';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import AscribeSpinner from '../../../lib/js/react/components/spinner';


const Assets = React.createClass({
    propTypes: {
        accountList: React.PropTypes.array,
        activeAccount: React.PropTypes.object,
        activeAsset: React.PropTypes.object,
        assetClasses: React.PropTypes.object,
        assetList: React.PropTypes.array,
        handleAssetClick: React.PropTypes.func
    },

    render() {
        const {
            activeAccount,
            accountList,
            assetList,
            activeAsset,
            assetClasses,
            handleAssetClick
        } = this.props;

        if (assetList) {
            if (assetList.length) {
                return (
                    <div>
                        {assetList.sort((a, b) => a.transaction.timestamp - b.transaction.timestamp)
                            .map((asset) => {
                                const active = (activeAsset) ? activeAsset.id === asset.id : false;
                                const assetClass = assetClasses[asset.transaction.conditions[0]
                                                       .new_owners[0]];

                                return (
                                    <AssetRow
                                        key={asset.id}
                                        accountList={active ? accountList : null}
                                        active={active}
                                        activeAccount={active ? activeAccount : null}
                                        asset={asset}
                                        assetClass={assetClass}
                                        handleAssetClick={handleAssetClick} />
                                );
                            })}
                    </div>
                );
            } else {
                return (
                    <div className="content-text">
                        No shares found on BigchainDB. Start trading...
                    </div>
                );
            }
        } else {
            return (
                <div style={{ margin: '2em' }}>
                    <AscribeSpinner />
                </div>
            );
        }
    }
});


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
        const validGlyph = asset.hasOwnProperty('assignee') ? <Glyphicon glyph="cog" />
                                                            : <Glyphicon glyph="ok" />;

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
            <Row onClick={this.handleAssetClick}>
                <div
                    className={classNames('asset-container',
                                            assetClass,
                                            { 'active': active && !transfered },
                                            { 'transfered': transfered })}>
                    <div className="asset-container-id">
                        {asset.id}
                    </div>
                    <div className="asset-container-detail">
                        {content ? `Row: ${content.y + 1}, Col: ${content.x + 1}` : '-'}
                    </div>
                    <div className="asset-container-timestamp">
                        {new Date(parseInt(asset.transaction.timestamp, 10) * 1000).toGMTString() + '   '}
                        {validGlyph}
                    </div>
                    {actionsPanel}
                </div>
            </Row>
        );
    }
});


const AssetActionPanel = React.createClass({
    propTypes: {
        accountList: React.PropTypes.array,
        activeAccount: React.PropTypes.object,
        handleAccountClick: React.PropTypes.func,
        handleTransferClick: React.PropTypes.func,
        selectedAccount: React.PropTypes.object
    },

    handleAccountClick(account) {
        this.props.handleAccountClick(account);
    },

    render() {
        const { activeAccount, selectedAccount, accountList, handleTransferClick } = this.props;

        let transferButton = null;
        if (selectedAccount) {
            transferButton = (
                <Button onClick={handleTransferClick}>
                    TRANSFER
                </Button>
            );
        }

        return (
            <div className="asset-container-actions">
                <div>Transfer asset from {activeAccount.name} to:</div>
                <DropdownButton
                    active
                    className="filter-dropdown-button"
                    id="bg-nested-dropdown"
                    title={selectedAccount ? selectedAccount.name : 'Select account'}>
                    {accountList.map((account) => (
                        <MenuItem
                            key={account.name}
                            onClick={() => this.handleAccountClick(account)}>
                            {account.name}
                        </MenuItem>
                    ))}
                </DropdownButton>
                {transferButton}
            </div>
        );
    }
});

export default Assets;
