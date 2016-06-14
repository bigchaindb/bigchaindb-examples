import React from 'react';
import moment from 'moment';
import { safeInvoke } from 'js-utility-belt/es6';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import AssetActionPanel from '../../../lib/js/react/components/asset_action_panel';
import AssetDetail from '../../../lib/js/react/components/asset_detail';


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
            expiresIn: null
        };
    },

    componentDidMount() {
        if (this.getOperation() !== 'transfer') {
            this.intervalId = window.setInterval(() => {
                this.setExpiryTime();
            }, 1000);
        }
    },

    componentWillUnmount() {
        window.clearInterval(this.intervalId);
    },

    setExpiryTime() {
        const {
            asset
        } = this.props;
        const expires = moment(parseInt(parseFloat(asset.expiryTime) * 1000, 10));
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

    handleActionClick(selectedAccount) {
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
            account
        } = this.props;

        const idToTransfer = {
            txid: asset.id,
            cid: 0
        };

        const payloadToPost = {
            source: account,
            to: account
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
            account
        } = this.props;

        const idToTransfer = {
            txid: asset.id,
            cid: 0
        };

        const payloadToPost = {
            source: account,
            to: selectedAccount
        };

        AssetActions.escrowAsset({
            idToTransfer,
            payloadToPost
        });

        this.setState({ inEscrow: true });
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

        const operation = this.getOperation();

        let actionsPanel = null;
        if (isActive && accountList) {
            const actionType = actionMap[`${asset.type}-${operation}`];
            actionsPanel = (
                <AssetActionPanel
                    accountList={accountList}
                    actionMessage={actionType.actionMessage}
                    actionName={actionType.actionName}
                    activeAccount={account}
                    handleActionClick={this.handleActionClick}
                    selectAccounts={actionType.selectAccounts} />
            );
        }


        let escrowDetails = null;
        if (expiresIn) {
            if (expiresIn === -1) {
                escrowDetails = (
                    <div>
                        EXPIRED
                    </div>
                );
            } else {
                escrowDetails = (
                    <div>
                        Expires in {expiresIn.format('HH:mm:ss')}
                    </div>
                );
            }
        }


        return (
            <div
                onClick={this.handleAssetClick}
                style={{ outline: 'none' }}
                tabIndex={0}>
                <AssetDetail
                    asset={asset}>
                    {escrowDetails}
                    {actionsPanel}
                </AssetDetail>
            </div>
        );
    }
});

export default AssetRow;
