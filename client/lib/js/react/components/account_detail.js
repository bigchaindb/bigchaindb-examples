import React from 'react';

import classnames from 'classnames';
import { Row } from 'react-bootstrap/lib';


const AccountDetail = ({
        account,
        activeAccount,
        handleClick
    }) => {
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
};

AccountDetail.propTypes = {
    account: React.PropTypes.object,
    activeAccount: React.PropTypes.object,
    handleClick: React.PropTypes.func
};

export default AccountDetail;
