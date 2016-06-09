import React from 'react';

import { Button, DropdownButton, MenuItem } from 'react-bootstrap/lib';


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

export default AssetActionPanel;
