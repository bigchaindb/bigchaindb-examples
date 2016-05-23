// Install necessary polyfills (see supported browsers) into global
import 'core-js/es6';
import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';

import { Router, Route, IndexRoute } from 'react-router';

import OnTheRecord from './components/on_the_record';

import '../../lib/css/scss/main.scss';


const App = React.createClass({
    propTypes: {
        children: React.PropTypes.oneOfType([
            React.PropTypes.arrayOf(React.PropTypes.element),
            React.PropTypes.element
        ]),
        routes: React.PropTypes.arrayOf(React.PropTypes.object)
    },

    render() {
        return (
            <div className="app on-the-record">
                {this.props.children}
            </div>
        );
    }
});

const routes = (
    <Route component={App} path="/">
        <IndexRoute component={OnTheRecord} />
    </Route>
);

ReactDOM.render((
    <Router>
        {routes}
    </Router>
), document.getElementById('bigchaindb-example-app'));
