import { request as baseRequest, sanitize } from 'js-utility-belt/es6';

import ApiUrls from '../constants/api_urls';


const DEFAULT_REQUEST_CONFIG = {
    credentials: 'include',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};

/**
 * Small wrapper around js-utility-belt's request that provides default settings and response
 * handling
 */
export default function request(url, config) {
    // Load default fetch configuration and remove any falsey query parameters
    const requestConfig = Object.assign({}, DEFAULT_REQUEST_CONFIG, config, {
        query: config.query && sanitize(config.query)
    });
    let apiUrl = url;

    if (!apiUrl.match(/^http/)) {
        apiUrl = ApiUrls[url];
        if (!url) {
            throw new Error(`Cannot find a url mapping for "${name}"`);
        }
    }

    return baseRequest(apiUrl, requestConfig)
        .then((res) => res.json())
        .catch((err) => {
            console.error(err);
            throw err;
        });
}
