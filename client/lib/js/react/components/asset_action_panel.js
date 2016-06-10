import React from 'react';

import { Button, DropdownButton, MenuItem } from 'react-bootstrap/lib';


const AssetActionPanel = React.createClass({
    propTypes: {
        accountList: React.PropTypes.array.isRequired,
        activeAccount: React.PropTypes.object.isRequired,
        handleActionClick: React.PropTypes.func.isRequired,
        actionName: React.PropTypes.string
    },

    getDefaultProps() {
        return {
            actionName: 'TRANSFER'
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
    },

    render() {
        const {
            activeAccount,
            accountList,
            actionName,
            handleActionClick,
        } = this.props;

        const {
            selectedAccount
        } = this.state;

        const transferButton = selectedAccount ?
            <Button onClick={() => handleActionClick(selectedAccount)}>{actionName}</Button> : null;

        return (
            <div className="asset-container-actions">
                <div>Transfer asset from {activeAccount.name} to:</div>
                <DropdownButton
                    active
                    className="filter-dropdown-button"
                    id="bg-nested-dropdown"
                    title={selectedAccount ? selectedAccount.name : 'Select account'}>
                    {
                        accountList
                            .filter((account) => account !== activeAccount)
                            .map((account) => (
                                <MenuItem
                                    key={account.name}
                                    onClick={() => this.setSelectedAccount(account)}>
                                    {account.name}
                                </MenuItem>
                            ))
                    }
                </DropdownButton>
                {transferButton}
            </div>
        );
    }
});

export default AssetActionPanel;
