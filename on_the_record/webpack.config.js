var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var InlineEnviromentVariablesPlugin = require('inline-environment-variables-webpack-plugin');


module.exports = {
    context: __dirname,

    devtool: 'source-map',

    entry:  './client/js/App.js',

    output: {
        path: path.resolve('./server/static/'),
        filename: "app.js"
    },

    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: ['babel-loader?presets[]=react&presets[]=es2015']
        }, {
            test: /.(png|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
            loader: 'url-loader?limit=100000'
        }, {
            test: /\.s[ac]ss/,
            loader: ExtractTextPlugin.extract('style-loader', 'css!sass?indentedSyntax=true&sourceMap=true&includePaths[]=' + (path.resolve(__dirname, "./node_modules")))
        }]
    },

    plugins: [
        new ExtractTextPlugin('style.css', {
            allChunks: true
        }),
        new InlineEnviromentVariablesPlugin('NODE_ENV')
    ],

    resolve: {
        modulesDirectories: ['node_modules', 'bower_components'],
        extensions: ['', '.js', '.jsx']
    }

};
