import React from 'react/';

import { Row } from 'react-bootstrap/lib/';

import classnames from 'classnames/';

import AccountActions from '../actions/account_actions';
import AccountStore from '../stores/account_store';

import BigchainDBLedger from './ledgerplugin';

import Spinner from './spinner';

const AccountList = React.createClass({
    propTypes: {
        activeAccount: React.PropTypes.object,
        appName: React.PropTypes.string,
        className: React.PropTypes.string,
        handleAccountClick: React.PropTypes.func
    },

    getInitialState() {
        return AccountStore.getState();
    },

    componentDidMount() {
        AccountStore.listen(this.onChange);
        this.fetchAccountList();
    },

    componentWillUnmount() {
        AccountStore.unlisten(this.onChange);
    },
    
    onChange(state) {
        this.setState(state);
    },

    fetchAccountList() {
        const { appName } = this.props;
        AccountActions.flushAccountList();
        AccountActions.fetchAccountList({ app: appName });
    },
    
    render() {
        const { activeAccount, className, handleAccountClick } = this.props;
        const { accountList } = this.state;

        if (accountList && accountList.length > 0) {
            return (
                <div className={classnames(className)}>
                    {accountList
                        .sort((a, b) => {
                            if (a.name < b.name) return -1;
                            if (a.name > b.name) return 1;
                            return 0;
                        })
                        .map(account => (
                            <AccountRow
                                key={account.name}
                                account={account}
                                activeAccount={activeAccount}
                                handleClick={handleAccountClick} />
                        ))}
                </div>
            );
        } else {
            return (
                <div style={{ margin: '2em' }}>
                    <Spinner />
                </div>
            );
        }
    }
});

const AccountRow = React.createClass({
    propTypes: {
        account: React.PropTypes.object,
        activeAccount: React.PropTypes.object,
        handleClick: React.PropTypes.func
    },
    
    connectToLedger() {
        const { account } = this.props;
        return new BigchainDBLedger({
            auth: {
                account: {
                    id: account.vk,
                    uri: 'ws://localhost:8888/users/' + account.vk
                }
            },
        });
    },
    
    handleClick() {
        const { account, handleClick } = this.props;
        const ledger = this.connectToLedger(account);
        ledger.connect().catch((err) => {
            console.error((err && err.stack) ? err.stack : err);
        });

        handleClick(account, ledger);
    },

    render() {
        const { account, activeAccount } = this.props;

        return (
            <div
                className={classnames('list-row', { 'active': activeAccount === account })}
                onClick={this.handleClick}
                tabIndex={0} >
                <Row>
                    <div className="list-row-name">
                        {account.name}
                    </div>
                    <div className="list-row-detail">
                        {account.vk}
                    </div>
                </Row>
            </div>
        );
    }
});

export default AccountList;
