'use strict'
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

const devWebpackConfig = merge(baseWebpackConfig, {
  output: {
    publicPath: '/'
  },
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    host: '127.0.0.1',
    port: 8010,
    historyApiFallback: false,
    noInfo: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    },
    open: true,
    openPage: ''
  },
  module: {
    rules: [{
      test: /\.(ttf|otf)$/,
      use: [{
        loader: "file-loader",
        options: {
          name: 'assets/fonts/[name].[ext]',
        }
      }]
    }]
  }
})

module.exports = devWebpackConfig