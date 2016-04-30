'use strict';

import moment from 'moment';

export function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    throw new Error(response.json());
}

export function getCookie(name) {
    let parts = document.cookie.split(';');

    for(let i = 0; i < parts.length; i++) {
        if(parts[i].indexOf(name + '=') > -1) {
            return parts[i].split('=').pop();
        }
    }
}

export function setCookie(key, value, days) {
    const exdate = moment();
    exdate.add(days, 'days');
    value = window.escape(value) + ((days === null) ? '' : `; expires= ${exdate.utc()}`);
    document.cookie = `${key}=${value}`;
}