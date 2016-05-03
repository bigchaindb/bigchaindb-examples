'use strict';

import React from 'react/';

import { Row, Col, Button, Glyphicon, DropdownButton, MenuItem } from 'react-bootstrap/lib/';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import AscribeSpinner from '../../../lib/js/react/components/spinner';

import classNames from 'classnames';


const Assets = React.createClass({
    propTypes: {
        activeAccount: React.PropTypes.object,
        accountList: React.PropTypes.array,
        activeAsset: React.PropTypes.object,
        assetList: React.PropTypes.array,
        assetClasses: React.PropTypes.object,
        handleAssetClick: React.PropTypes.func
    },

    render() {
        let { activeAccount, accountList, assetList, activeAsset, assetClasses, handleAssetClick } = this.props;

        if ( assetList && assetList.length > 0 ) {
            return (
                <div>
                    {assetList.sort((a, b) => a.transaction.timestamp - b.transaction.timestamp)
                        .map(( asset ) => {
                            const active = (activeAsset) ? activeAsset.id === asset.id : false;
                            const assetClass = assetClasses[asset.transaction.conditions[0].new_owners[0]];

                            return (
                                <AssetRow
                                    key={ asset.id }
                                    asset={ asset }
                                    active={ active }
                                    activeAccount={ active ? activeAccount: null }
                                    accountList={ active ? accountList : null }
                                    assetClass={ assetClass }
                                    handleAssetClick={ handleAssetClick }/>
                            );
                        })}
                </div>
            );
        }
    else if ( assetList && assetList.length == 0 ) {

            return (
                <div className='content-text'>
                    No shares found on BigchainDB. Start trading...
                </div>
            );
        }

        return (
            <div style={{margin: '2em'}}>
                <AscribeSpinner />
            </div>
        );
    }
});


const AssetRow = React.createClass({

    propTypes: {
        asset: React.PropTypes.object,
        active: React.PropTypes.bool,
        activeAccount: React.PropTypes.object,
        accountList: React.PropTypes.array,
        assetClass: React.PropTypes.string,
        handleAssetClick: React.PropTypes.func
    },

    getInitialState() {
        return {
            selectedAccount: null
        }
    },

    setSelectedAccount(account) {
        this.setState({selectedAccount: account})
    },

    handleAssetClick() {
        const { asset, handleAssetClick } = this.props;
        handleAssetClick( asset );
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
        AssetActions.transferAsset({idToTransfer: idToTransfer, payloadToPost: payloadToPost});
        console.log('transfer', asset, activeAccount, selectedAccount)
    },

    render() {
        const { asset, active, activeAccount, accountList, assetClass } = this.props;
        const { selectedAccount } = this.state;

        const inBacklog = 'assignee' in asset;
        const data = asset.transaction.data;
        const validGlyph = inBacklog ? <Glyphicon glyph="cog"/> : <Glyphicon glyph="ok"/>;

        let actionsPanel = null;
        if (active && activeAccount && accountList) {
            actionsPanel = (
                <AssetActionPanel
                    activeAccount={ activeAccount}
                    selectedAccount={ selectedAccount }
                    accountList={ accountList }
                    handleAccountClick={ this.setSelectedAccount }
                    handleTransferClick={ this.handleTransferClick } />
            );
        }

        return (
            <Row onClick={ this.handleAssetClick }>
                <div className={classNames('asset-container', assetClass, {'active': active})}>
                    <div className='asset-container-id'>
                        { asset.id }
                    </div>
                    <div className='asset-container-detail'>
                        {  data ?
                            'Row: ' + (data.payload.content.y + 1) + ', Col: ' + (data.payload.content.x + 1) :
                            '-'
                        }
                    </div>
                    <div className='asset-container-timestamp'>
                        { new Date(parseInt(asset.transaction.timestamp, 10)*1000).toGMTString() + '   ' }
                        { validGlyph }
                    </div>
                    { actionsPanel }
                </div>
            </Row>
        );
    }
});


const AssetActionPanel = React.createClass({
    propTypes: {
        activeAccount: React.PropTypes.object,
        selectedAccount: React.PropTypes.object,
        accountList: React.PropTypes.array,
        handleAccountClick: React.PropTypes.func,
        handleTransferClick: React.PropTypes.func
    },

    handleAccountClick(account) {
        this.props.handleAccountClick(account);
    },

    render() {
        const { activeAccount, selectedAccount, accountList, handleTransferClick } = this.props;

        let transferButton = null;
        if ( selectedAccount ){
            transferButton = (
                <Button onClick={ handleTransferClick }>
                    TRANSFER
                </Button>
            );
        }

        return (
            <div className="asset-container-actions">
                <div>Transfer asset from { activeAccount.name } to:</div>
                <DropdownButton
                    active
                    title={ selectedAccount ? selectedAccount.name : 'Select account' }
                    className='filter-dropdown-button'
                    id="bg-nested-dropdown">
                    {accountList.map(( account ) => {
                        return (
                            <MenuItem
                                key={ account.name }
                                onClick={ this.handleAccountClick.bind( this, account )}>
                                { account.name }
                            </MenuItem>
                        );
                    })}
                </DropdownButton>
                { transferButton }
            </div>
        )
    }
});

export default Assets;
