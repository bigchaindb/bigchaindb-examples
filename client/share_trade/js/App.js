'use strict';

import 'babel/polyfill';
import fetch from 'isomorphic-fetch/';

import '../scss/main.scss';

import React from 'react/';
import ReactDOM from 'react-dom/';

import { Router, Route, IndexRoute } from 'react-router/';

import OnTheRecord from './components/share_trade';


let App = React.createClass({
    propTypes: {
        children: React.PropTypes.oneOfType([
            React.PropTypes.arrayOf(React.PropTypes.element),
            React.PropTypes.element
        ]),
        routes: React.PropTypes.arrayOf(React.PropTypes.object)
    },

    render() {
        return (
            <div className="App">
                {this.props.children}
            </div>
        );
    }
});

let routes = (
    <Route path='/' component={App}>
        <IndexRoute component={OnTheRecord} />
    </Route>
);

ReactDOM.render((
    <Router>
        {routes}
    </Router>
), document.getElementById('container'));

