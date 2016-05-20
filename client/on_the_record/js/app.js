// Install necessary polyfills (see supported browsers) into global
import 'core-js/es6';
import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';

import OnTheRecord from './components/on_the_record';

import '../../lib/css/scss/main.scss';


const App = () => (
    <div className="app on-the-record">
        <OnTheRecord />
    </div>
);

ReactDOM.render(<App />, document.getElementById('bigchaindb-example-app'));
