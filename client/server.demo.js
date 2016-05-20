'use strict';
const path = require('path');

const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('./webpack.config.js');

require('dotenv').load({ silent: true });

const HOST_NAME = process.env.CLIENT_HOST || 'localhost';
const PORT = process.env.CLIENT_PORT || 3000;

// Enable hot reloading if on demo mode
if (process.env.NODE_ENV === 'demo') {
    // Each entry must have the hot dev server included
    Object.keys(config.entry).forEach((entryName) => {
        config.entry[entryName] = [
            config.entry[entryName],
            'webpack/hot/dev-server',
            `webpack-dev-server/client?http://${HOST_NAME}:${PORT}/`
        ];
    });
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    // React hot reloading is enabled through .babelrc and babel-react-transform
}

// Specify output location for bundled files
config.output.publicPath = '/';

// Configure server
const compiler = webpack(config);

const server = new WebpackDevServer(compiler, {
    publicPath: config.output.publicPath,
    contentBase: './demo',
    hot: true,
    noInfo: true,
    stats: { colors: true }
});

// Start server
server.listen(PORT, HOST_NAME, (err) => {
    if (err) {
        console.error(`Demo server ran into ${err} while starting on  ${HOST_NAME}:${PORT}. Shutting down...`);
        server.close();
    }
    console.log(`Demo server running on ${HOST_NAME}:${PORT}`);
});
