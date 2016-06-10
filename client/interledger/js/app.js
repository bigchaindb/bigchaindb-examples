// Install necessary polyfills (see supported browsers) into global
import 'core-js/es6';
import 'core-js/stage/4';
import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';

import Interledger from './components/interledger';

import '../../lib/css/scss/main.scss';


const App = () => (
    <div className="app interledger">
        <Interledger />
    </div>
);

ReactDOM.render(<App />, document.getElementById('bigchaindb-example-app'));
