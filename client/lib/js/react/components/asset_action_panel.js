import React from 'react';

import { Button, DropdownButton, MenuItem } from 'react-bootstrap/lib';
import { safeInvoke } from 'js-utility-belt/es6';


const AssetActionPanel = React.createClass({
    propTypes: {
        accountList: React.PropTypes.array.isRequired,
        activeAccount: React.PropTypes.object.isRequired,
        handleActionClick: React.PropTypes.func.isRequired,
        actionMessage: React.PropTypes.string,
        actionName: React.PropTypes.string,
        handleAccountSelection: React.PropTypes.func,
        selectAccounts: React.PropTypes.bool
    },

    getDefaultProps() {
        return {
            actionMessage: 'Transfer asset to:',
            actionName: 'TRANSFER',
            selectAccounts: true
        };
    },

    getInitialState() {
        return {
            selectedAccount: null
        };
    },

    setSelectedAccount(account) {
        this.setState({
            selectedAccount: account
        });

        safeInvoke(this.props.handleAccountSelection, account);
    },

    render() {
        const {
            accountList,
            actionMessage,
            actionName,
            activeAccount,
            handleActionClick,
            selectAccounts
        } = this.props;

        const {
            selectedAccount
        } = this.state;

        const transferButton = (!selectAccounts || selectedAccount) ?
            <Button
                bsSize="xsmall"
                onClick={() => handleActionClick(selectedAccount)}>
                {actionName}
            </Button> : null;

        const accountDropdown = selectAccounts ?
            <DropdownButton
                active
                bsSize="xsmall"
                className="filter-dropdown-button"
                id="bg-nested-dropdown"
                title={selectedAccount ? selectedAccount.name : 'Select account'}>
                {
                    accountList
                        .filter((account) => account !== activeAccount)
                        .map((account) => (
                            <MenuItem
                                key={account.vk}
                                onClick={() => this.setSelectedAccount(account)}>
                                {account.name}
                            </MenuItem>
                        ))
                }
            </DropdownButton> : null;

        return (
            <div className="asset-container-actions">
                <div>{actionMessage}</div>
                {accountDropdown}
                {transferButton}
            </div>
        );
    }
});


export default AssetActionPanel;
