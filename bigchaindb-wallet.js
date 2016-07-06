import React from 'react';
import { Client } from 'ilp-core';


const BigchainDBWallet = React.createClass({
    render() {
        const client = new Client({
            type: 'bells',
            auth: {
                account: 'https://red.ilpdemo.org/ledger/accounts/alice',
                password: 'alice'
            }
        });
        return (
            <div>hello</div>
        );
    }
});

export default BigchainDBWallet