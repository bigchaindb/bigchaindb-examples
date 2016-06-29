/* eslint-disable strict, no-console, object-shorthand */
/* eslint-disable import/no-extraneous-dependencies, import/newline-after-import */
'use strict';

const path = require('path');

const webpack = require('webpack');
const autoPrefixer = require('autoprefixer');
const combineLoaders = require('webpack-combine-loaders');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

require('dotenv').load({ path: '../.env', silent: true });

const PRODUCTION = process.env.NODE_ENV === 'production';
const EXTRACT = process.env.NODE_ENV === 'extract';

const PATHS = {
    ON_THE_RECORD: path.resolve(__dirname, 'on_the_record/js/app.js'),
    SHARE_TRADER: path.resolve(__dirname, 'share_trader/js/app.js'),
    INTERLEDGER: path.resolve(__dirname, 'interledger/js/app.js'),

    BUILD: path.resolve(__dirname, 'build'),
    DIST: path.resolve(__dirname, 'dist'),
    NODE_MODULES: path.resolve(__dirname, 'node_modules'),
};


/** ENTRY POINTS **/
const ENTRY = {
    // Use one entry per app
    ontherecord: PATHS.ON_THE_RECORD,
    sharetrader: PATHS.SHARE_TRADER,
    interledger: PATHS.INTERLEDGER,
};

const ENTRY_NAMES = {
    ontherecord: 'On the Record',
    sharetrader: 'Share Trader',
    interledger: 'Interledger',
};


/** EXTERNAL DEFINITIONS INJECTED INTO APP **/
const DEFINITIONS = {
    'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        FLASK_BASE_URL: JSON.stringify(`http://${process.env.FLASK_HOST || 'localhost'}:` +
                                       `${process.env.FLASK_PORT || '8000'}`),
        TORNADO_BASE_URL: JSON.stringify(`ws://${process.env.TORNADO_HOST || 'localhost'}:` +
                                         `${process.env.TORNADO_PORT || '8888'}`),
    },
};


/** PLUGINS **/
const PLUGINS = [
    new webpack.DefinePlugin(DEFINITIONS),
    new webpack.NoErrorsPlugin(),
];

const PROD_PLUGINS = [
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        output: {
            comments: false
        },
        sourceMap: true,
    }),
    new webpack.LoaderOptionsPlugin({
        debug: false,
        minimize: true
    }),
];

const EXTRACT_CSS_PLUGIN = new ExtractTextPlugin(
    PRODUCTION ? '[name]/styles.min.css' : '[name]/styles.css', {
        allChunks: true
    }
);

// Generate html files for each of the example apps specified in ENTRY
const HTML_PLUGINS = Object.keys(ENTRY).map((entryName) => (
    new HtmlWebpackPlugin({
        filename: `${entryName}/index.html`,
        title: `${ENTRY_NAMES[entryName]} - powered by BigchainDB`,
        chunks: [entryName],
        minify: PRODUCTION ? {
            collapseWhitespace: true,
            minifyJS: true,
            removeComments: true,
            removeRedundantAttributes: true
        } : false,
        template: path.resolve(__dirname, 'app_index_template.html'),

        // Our own options
        PRODUCTION: PRODUCTION
    })
));

PLUGINS.push(...HTML_PLUGINS);

if (EXTRACT || PRODUCTION) {
    PLUGINS.push(EXTRACT_CSS_PLUGIN);
}

if (PRODUCTION) {
    PLUGINS.push(...PROD_PLUGINS);
}


/** LOADERS **/
const JS_LOADER = combineLoaders([
    {
        loader: 'babel',
        query: {
            cacheDirectory: true,
        },
    },
]);

const CSS_LOADER = combineLoaders([
    {
        loader: 'css',
        query: {
            sourceMap: true
        }
    },
    { loader: 'postcss' },
    {
        loader: 'sass',
        query: {
            precision: '8', // See https://github.com/twbs/bootstrap-sass#sass-number-precision
            outputStyle: 'expanded',
            sourceMap: true
        }
    },
]);

const LOADERS = [
    {
        test: /\.jsx?$/,
        exclude: [PATHS.NODE_MODULES],
        loader: JS_LOADER,
    },
    {
        test: /\.s[ac]ss$/,
        exclude: [PATHS.NODE_MODULES],
        loader: PRODUCTION || EXTRACT ? ExtractTextPlugin.extract('style', CSS_LOADER)
                                      : `style!${CSS_LOADER}`,
    },
    {
        test: /.(png|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
        loader: 'url-loader?limit=100000'
    },
];


/** EXPORTED WEBPACK CONFIG **/
module.exports = {
    entry: ENTRY,

    output: {
        filename: PRODUCTION ? '[name]/bundle.min.js' : '[name]/bundle.js',
        path: PRODUCTION ? PATHS.DIST : PATHS.BUILD,
    },

    debug: !PRODUCTION,

    devtool: PRODUCTION ? '#source-map' : '#inline-source-map',

    resolve: {
        extensions: ['', '.js', '.jsx'],
        modules: ['node_modules'], // Don't use absolute path here to allow recursive matching
    },

    plugins: PLUGINS,

    module: {
        loaders: LOADERS,
    },

    postcss: [autoPrefixer()],
};
