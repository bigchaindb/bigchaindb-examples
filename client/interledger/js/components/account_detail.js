import React from 'react';

import classnames from 'classnames';
import { Col } from 'react-bootstrap/lib';

import Assets from './assets';


const AccountDetail = React.createClass({
    propTypes: {
        account: React.PropTypes.object,
        activeAccount: React.PropTypes.object,
        assetList: React.PropTypes.object,
        handleClick: React.PropTypes.func
    },

    render() {
        const {
            account,
            activeAccount,
            assetList,
            handleClick
        } = this.props;
        
        if (account) {
            const assetListForAccount = assetList[account.vk];
            return (
                <Col
                    className={classnames({ 'active': activeAccount === account })}
                    md={6} lg={4} xl={3}
                    onClick={handleClick}>
                    <div className="card">
                        <div className="list-row-name">
                            {account.name}
                        </div>
                        <div className="list-row-detail">
                            {account.vk}
                        </div>
                        <Assets
                            activeAccount={account}
                            assetListForAccount={assetListForAccount} />
                    </div>
                </Col>
            );
        }
        return null;
    }
});

export default AccountDetail;
