'use strict'

import camelCase from 'camelcase';
import decamelize from 'decamelize';
import qs from 'qs';

import { sanitize } from './general_utils';

// TODO: Create Unittests that test all functions

/**
 * Takes a key-value dictionary of this form:
 *
 *  {
 *     'page': 1,
 *     'pageSize': 10
 *  }
 *
 * and converts it to a query-parameter, which you can append to your URL.
 * The return looks like this:
 *
 * ?page=1&page_size=10
 *
 * CamelCase gets converted to snake_case!
 *
 * @param  {object} obj Query params dictionary
 * @return {string}     Query params string
 */
export function argsToQueryParams(obj) {
    const sanitizedObj = sanitize(obj);
    const queryParamObj = {};

    Object
        .keys(sanitizedObj)
        .forEach((key) => {
            queryParamObj[decamelize(key)] = sanitizedObj[key];
        });

    // Use bracket arrayFormat as history.js and react-router use it
    return '?' + qs.stringify(queryParamObj, { arrayFormat: 'brackets' });
}

/**
 * Get the current url's query params as an key-val dictionary.
 * snake_case gets converted to CamelCase!
 * @return {object} Query params dictionary
 */
export function getCurrentQueryParams() {
    return queryParamsToArgs(window.location.search.substring(1));
}

/**
 * Convert the given query param string into a key-val dictionary.
 * snake_case gets converted to CamelCase!
 * @param  {string} queryParamString Query params string
 * @return {object}                  Query params dictionary
 */
export function queryParamsToArgs(queryParamString) {
    const qsQueryParamObj = qs.parse(queryParamString);
    const camelCaseParamObj = {};

    Object
        .keys(qsQueryParamObj)
        .forEach((key) => {
            camelCaseParamObj[camelCase(key)] = qsQueryParamObj[key];
        });

    return camelCaseParamObj;
}

/**
 * Takes a string and a boolean and generates a string query parameter for
 * an API call.
 */
export function generateOrderingQueryParams(orderBy, orderAsc) {
    let interpolation = '';

    if(!orderAsc) {
        interpolation += '-';
    }

    return interpolation + orderBy;
}
