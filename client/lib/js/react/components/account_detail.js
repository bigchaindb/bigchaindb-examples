import React from 'react';

import classnames from 'classnames';
import { Row } from 'react-bootstrap/lib';


const AccountDetail = ({
        account,
        isActive,
        handleClick
    }) => {
    return (
        <Row
            className={classnames('list-row', { 'active': isActive })}
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
    handleClick: React.PropTypes.func,
    isActive: React.PropTypes.bool
};

export default AccountDetail;
