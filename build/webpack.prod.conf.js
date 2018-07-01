'use strict'
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const glob = require('glob')
const fs = require('fs')

function scanCharacters() {
  let characters = new Set()

  function updateCharacters(path) {
    let str = (fs.readFileSync(path, 'utf8') || '')
    characters = new Set([...characters, ...str])
  }

  glob.sync('./src/pages/**/*.{html,md,vue}').forEach(updateCharacters)
  glob.sync('./src/components/*.vue').forEach(updateCharacters)
  
  let digits = '0123456789'
  characters = new Set([...characters, ...digits])
  return [...characters];
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