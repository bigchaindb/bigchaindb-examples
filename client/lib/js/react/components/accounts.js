import React from 'react/';

import { Row } from 'react-bootstrap/lib/';

import classnames from 'classnames/';

import AccountActions from '../actions/account_actions';
import AccountStore from '../stores/account_store';

import AscribeSpinner from './spinner';

const Accounts = React.createClass({
    propTypes: {
        activeAccount: React.PropTypes.object,
        appName: React.PropTypes.string,
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

    fetchAccountList() {
        const { appName } = this.props;
        AccountActions.flushAccountList();
        AccountActions.fetchAccountList({ app: appName });
    },

    onChange(state) {
        this.setState(state);
    },

    render() {
        const { activeAccount, handleAccountClick } = this.props;
        const { accountList } = this.state;

        if (accountList && accountList.length > 0) {
            return (
                <div>
                    {accountList
                        .sort((a, b) => {
                            if (a.name < b.name) return -1;
                            if (a.name > b.name) return 1;
                            return 0;
                        })
                        .map(account => (
                            <AccountRow
                                account={account}
                                activeAccount={activeAccount}
                                handleClick={handleAccountClick}
                                key={account.name} />
                        ))}
                </div>
            );
        } else {
            return (
                <div style={{ margin: '2em' }}>
                    <AscribeSpinner />
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

    handleClick() {
        this.props.handleClick(this.props.account);
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

export default Accounts;
