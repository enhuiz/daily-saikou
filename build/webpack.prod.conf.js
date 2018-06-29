'use strict'
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const glob = require('glob')
const fs = require('fs')

function scanCharacters() {
  let characters = new Set()
  glob.sync('./src/pages/**/*.{html,md,vue}').forEach(path => {
    let str = (fs.readFileSync(path, 'utf8') || '')
    characters = new Set([...characters, ...str])
  })
  let digits = '0123456789';
  return [...characters, ...digits]
}

const prodWebpackConfig = merge(baseWebpackConfig, {
  devtool: '#source-map',
  output: {
    publicPath: '/daily-saikou/'
  },
  module: {
    rules: [{
      test: /\.(ttf|otf)$/,
      use: [{
        loader: "fontmin-loader",
        options: {
          name: 'assets/fonts/[name].[ext]',
          text: scanCharacters().join(''),
        }
      }]
    }]
  },
  plugins: [
    new OptimizeCSSPlugin()
  ]
})

module.exports = prodWebpackConfig