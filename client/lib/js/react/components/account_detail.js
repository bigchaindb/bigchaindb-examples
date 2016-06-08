import React from 'react';

import classnames from 'classnames';
import { Row } from 'react-bootstrap/lib';


const AccountDetail = React.createClass({
    propTypes: {
        account: React.PropTypes.object,
        activeAccount: React.PropTypes.object,
        handleClick: React.PropTypes.func
    },

    render() {
        const { account, activeAccount, handleClick } = this.props;

        return (
            <Row
                className={classnames('list-row', { 'active': activeAccount === account })}
                onClick={handleClick}>
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

export default AccountDetail;
