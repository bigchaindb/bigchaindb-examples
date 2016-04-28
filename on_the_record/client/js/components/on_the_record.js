'use strict';

import React from 'react/';

import { History } from 'react-router/';

import { Row, Col, Button, Glyphicon } from 'react-bootstrap/lib/';

import AccountList from './accounts';
import Assets from './assets';

const OnTheRecord = React.createClass({

    propTypes: {
        params: React.PropTypes.object
    },

    mixins: [History],
    
    getInitialState() {
        return {
            activeAccount: null
        };
    },

    setActiveAccount(account){
        this.setState({
            activeAccount: account
        });
    },

    render() {
        const { activeAccount } = this.state;
        let activeAccountElement = (
            <div>
                Select account from list:
            </div>
        );

        if ( activeAccount ) {
            activeAccountElement = (
                <div
                    className='list-item'
                    onClick={this.handleClick}>
                    <Row>
                        <div className='list-row-name'>
                            {activeAccount.name}
                        </div>
                        <div className='list-row-detail'>
                            {activeAccount.vk}
                        </div>
                    </Row>
                </div>
            );
        }

        let content = null;

        if ( activeAccount ) {

            content = (
                <Assets
                    activeAccount={activeAccount}/>
            );
        }
        else {
            content = (
                <AccountList
                    activeAccount={activeAccount}
                    handleAccountClick={this.setActiveAccount}/>
            );
        }

        return (
            <div id="wrapper">
                <h1>On the record</h1>
                <br />
                { activeAccountElement }
                <br />
                { content }
            </div>
        );
    }
});


export default OnTheRecord;
