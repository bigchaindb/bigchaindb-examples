import React from 'react';

import classnames from 'classnames';
import { Col } from 'react-bootstrap/lib';


const AccountDetail = React.createClass({
    propTypes: {
        account: React.PropTypes.object,
        activeAccount: React.PropTypes.object,
        assetList: React.PropTypes.object,
        handleClick: React.PropTypes.func
    },

    render() {
        const { account, activeAccount, assetList, handleClick } = this.props;
        return (
            <Col
                className={classnames({ 'active': activeAccount === account })}
                md={4}
                onClick={handleClick}>
                <div className="card">
                    <div className="list-row-name">
                        {account.name}
                    </div>
                    <div className="list-row-detail">
                        {account.vk}
                    </div>
                </div>
            </Col>
        );
    }
});

export default AccountDetail;
