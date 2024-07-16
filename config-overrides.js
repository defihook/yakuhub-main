const webpack = require('webpack');
module.exports = function override(config, env) {
    config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
    });
    config.resolve.fallback = {
        url: require.resolve('url'),
        fs: false,
        util: require.resolve('util'),
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
        zlib: require.resolve("browserify-zlib")
    };
    config.plugins.push(
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        })
    );
    return config;
};
