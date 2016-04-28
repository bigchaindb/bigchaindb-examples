'use strict';

import useBasename from 'history/lib/useBasename';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import AppConstants from './constants/application_constants';


// Remove the trailing slash if present
let baseUrl = AppConstants.baseUrl.replace(/\/$/, '');

export default useBasename(createBrowserHistory)({
    basename: baseUrl
});
