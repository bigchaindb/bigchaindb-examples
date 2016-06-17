import React from 'react';

import classnames from 'classnames';
import { Col } from 'react-bootstrap/lib';

import Assets from './assets';


const AccountDetail = React.createClass({
    propTypes: {
        account: React.PropTypes.object,
        accountList: React.PropTypes.array,
        activeAccount: React.PropTypes.object,
        activeAsset: React.PropTypes.object,
        assetList: React.PropTypes.object,
        handleAssetClick: React.PropTypes.func,
        handleClick: React.PropTypes.func
    },

    render() {
        const {
            account,
            accountList,
            activeAccount,
            activeAsset,
            assetList,
            handleAssetClick,
            handleClick
        } = this.props;

        if (account && assetList && Array.isArray(assetList[account.vk])) {
            const assetListForAccount = assetList[account.vk];
            return (
                <Col
                    className={classnames({ 'active': activeAccount === account })}
                    md={6} lg={4} xl={3}>
                    <div className="card">
                        <div className="list-row-name">
                            {account.name}
                        </div>
                        <div className="list-row-detail">
                            {account.vk}
                        </div>
                        <Assets
                            accountList={accountList}
                            account={account}
                            activeAsset={activeAsset}
                            assetList={assetListForAccount}
                            handleAccountClick={handleClick}
                            handleAssetClick={handleAssetClick} />
                    </div>
                </Col>
            );
        }
        return null;
    }
});

export default AccountDetail;
