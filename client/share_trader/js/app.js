// Install necessary polyfills (see supported browsers) into global
import 'core-js/es6';
import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';

import ShareTrader from './components/share_trader';

import '../../lib/css/scss/main.scss';


const App = () => (
    <div className="app share-trader">
        <ShareTrader />
    </div>
);

ReactDOM.render(<App />, document.getElementById('bigchaindb-example-app'));
