import React from 'react';

import classnames from 'classnames';
import { Row } from 'react-bootstrap/lib';


export default function AccountDetail(props) {
    const {
        account,
        activeAccount,
        handleClick
    } = props;

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

AccountDetail.propTypes = {
    account: React.PropTypes.object,
    activeAccount: React.PropTypes.object,
    handleClick: React.PropTypes.func
};
