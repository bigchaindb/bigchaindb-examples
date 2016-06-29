import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import { safeInvoke } from 'js-utility-belt/es6';

import AssetActionPanel from '../../../lib/js/react/components/asset_action_panel';
import AssetDetail from '../../../lib/js/react/components/asset_detail';

import inBacklog from '../../../lib/js/utils/bigchaindb/in_backlog';


const AssetRow = React.createClass({
    propTypes: {
        account: React.PropTypes.object.isRequired,
        asset: React.PropTypes.object.isRequired,
        accountList: React.PropTypes.array,
        actionMap: React.PropTypes.object,
        handleAccountClick: React.PropTypes.func,
        handleAssetClick: React.PropTypes.func,
        isActive: React.PropTypes.bool
    },

    getDefaultProps() {
        return {
            actionMap: {
                'single-owner-transfer': {
                    actionName: 'ESCROW',
                    actionMessage: 'Escrow asset with:',
                    selectAccounts: true
                },
                'multi-owner-execute': {
                    actionName: 'EXECUTE',
                    actionMessage: 'Execute escrow of asset:',
                    selectAccounts: false
                },
                'multi-owner-abort': {
                    actionName: 'ABORT',
                    actionMessage: 'Abort escrow of asset:',
                    selectAccounts: false
                }
            }
        };
    },

    getInitialState() {
        return {
            connectors: null,
            expiresIn: null
        };
    },

    componentDidMount() {
        if (this.getOperation() !== 'transfer') {
            this.intervalId = window.setInterval(this.setExpiryTime, 1000);
        }
    },

    componentWillUnmount() {
        window.clearInterval(this.intervalId);
    },

    setExpiryTime() {
        const {
            asset
        } = this.props;
        const expires = moment.unix(parseFloat(asset.expiryTime));
        const expiresIn = moment.utc(expires.diff(moment.utc()));
        this.setState({
            expiresIn: expiresIn > 0 ? expiresIn : -1
        });
    },

    handleAssetClick() {
        const {
            account,
            handleAccountClick,
            asset,
            handleAssetClick
        } = this.props;

        safeInvoke(handleAssetClick, asset);
        safeInvoke(handleAccountClick, account);
    },

    handleDestinationAccountSelection(destinationAccount) {
        const {
            account,
            asset
        } = this.props;

        account.ledger.getConnectors().then((res) => {
            this.setState({
                connectors: res.connectors
            });
        });

        // quoting should happen here
        // const quotes = connectors.map((connector) => connector.getQuote(asset, destinationAccount));
    },

    handleActionClick(selectedAccount) {
        const {
            connectors
        } = this.state;

        const {
            account,
            asset
        } = this.props;

        const idToTransfer = {
            txid: asset.id,
            cid: 0
        };

        if (asset.type === 'single-owner') {
            const transfer = {
                account: selectedAccount.ledger.id === account.ledger.id ?
                    selectedAccount : connectors[0],
                asset: idToTransfer,
                destinationAccount: selectedAccount,
                executionCondition: 'cc:0:3:47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU:0',
                expiresAt: moment().unix() + 100
            };

            account.ledger.send(transfer);
        } else if (asset.type === 'multi-owner') {
            const transfer = {
                account,
                asset: idToTransfer
            };
            if (this.getOperation() === 'execute') {
                const conditionFulfillment = 'cf:0:';
                account.ledger.fulfillCondition(transfer, conditionFulfillment);
            } else {
                account.ledger.fulfillCondition(transfer);
            }
        }
    },

    getOperation() {
        const {
            account,
            asset
        } = this.props;

        let operation = 'transfer';
        if (asset.hasOwnProperty('executeCondition') &&
            account.vk === asset.executeCondition.public_key) {
            operation = 'execute';
        } else if (asset.hasOwnProperty('abortCondition') &&
            account.vk === asset.abortCondition.public_key) {
            operation = 'abort';
        }
        return operation;
    },

    render() {
        const {
            account,
            accountList,
            actionMap,
            asset,
            isActive
        } = this.props;

        const {
            expiresIn
        } = this.state;

        const assetInBacklog = inBacklog(asset);
        const operation = this.getOperation();

        let actionsPanel = null;
        if (isActive && accountList && !assetInBacklog) {
            const actionType = actionMap[`${asset.type}-${operation}`];
            actionsPanel = (
                <AssetActionPanel
                    accountList={accountList}
                    actionMessage={actionType.actionMessage}
                    actionName={actionType.actionName}
                    activeAccount={account}
                    handleAccountSelection={this.handleDestinationAccountSelection}
                    handleActionClick={this.handleActionClick}
                    selectAccounts={actionType.selectAccounts} />
            );
        }


        let escrowDetails = null;
        if (expiresIn) {
            const isExpired = expiresIn === -1;
            escrowDetails = (
                <div className={classnames('asset-escrow-details', { isExpired })}>
                    {isExpired ? 'EXPIRED' : `Expires in ${expiresIn.format('HH:mm:ss')}`}
                </div>
            );
        }


        return (
            <div
                onClick={this.handleAssetClick}
                style={{ outline: 'none' }}
                tabIndex={0}>
                <AssetDetail
                    asset={asset}
                    className={classnames({ inBacklog: assetInBacklog })}
                    inBacklog={assetInBacklog}>
                    {escrowDetails}
                    {actionsPanel}
                </AssetDetail>
            </div>
        );
    }
});

export default AssetRow;
