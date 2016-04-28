'use strict';

import React from 'react/';

import {Navbar, Row } from 'react-bootstrap/lib/';

import AccountList from './accounts';
import Assets from './assets';

const OnTheRecord = React.createClass({

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

        let content = (
            <div className='content-text'>
                Select account from the list...
            </div>
        );

        if ( activeAccount ) {
            content = (
                <Assets
                    activeAccount={activeAccount}/>
            );
        }

        return (
            <div>
                <Navbar
                    inverse
                    fixedTop={true}>
                    <h1 style={{ textAlign: 'center', color: 'white'}}>"On the Record"</h1>
                </Navbar>
                <div id="wrapper">
                    <br />
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <AccountList
                                activeAccount={activeAccount}
                                handleAccountClick={this.setActiveAccount}/>
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <div className="page-content">
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});


export default OnTheRecord;
