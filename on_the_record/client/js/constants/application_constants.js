'use strict';

const apiEndpoint = process.env.NODE_ENV === 'production' ?
    'http://ascribe-diamonds-explorer.herokuapp.com/api/' : 'http://localhost:8000/api/';
const baseUrl = '/';

const constants = {
    baseUrl,
    apiEndpoint
};

export default constants;
