import React from 'react';

import { Row } from 'react-bootstrap/lib';


const AccountRow = React.createClass({
    propTypes: {
        account: React.PropTypes.object,
        activeAccount: React.PropTypes.object
    },

    render() {
        const { account, activeAccount } = this.props;

        return (
            <Row>
                <div className="list-row-name">
                    {account.name}
                </div>
                <div className="list-row-detail">
                    {account.vk}
                </div>
            </Row>
        );
    }
});

export default AccountRow;
