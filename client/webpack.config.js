var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = {
    context: __dirname,

    devtool: 'source-map',

    entry:  {
        on_the_record: "./client/on_the_record/js/App.js",
        share_trader: "./client/share_trader/js/App.js"
    },

    output: {
        path: path.resolve(path.join(__dirname, '/server/static/')),
        filename: "[name].js"
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
        })
    ],

    resolve: {
        modulesDirectories: ['node_modules', 'bower_components'],
        extensions: ['', '.js', '.jsx']
    },

    resolveLoader: {
        root: path.join(__dirname, 'node_modules')
    }

};
