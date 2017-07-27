var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        main: './index.ts',
        style: './site.scss'
    },
    output: {
        filename: './bundle.[name].js'
    },
    devtool: 'source-map',
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' },
            {
                test: /\.scss/,
                loader: ExtractTextPlugin.extract('css-loader?-url&minimize&sourceMap!sass-loader')
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('site.min.css')
    ]
};