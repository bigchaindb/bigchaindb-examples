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

    render() {
        const {
            activeAccount,
            selectedAccount,
            accountList,
            handleAccountClick,
            handleTransferClick
        } = this.props;

        const transferButton = selectedAccount ?
            <Button onClick={handleTransferClick}>TRANSFER</Button> : null;

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
                            onClick={() => handleAccountClick(account)}>
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
