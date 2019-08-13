'use strict'

const {
  join,
  resolve
} = require('path')

const glob = require('glob')
const fs = require('fs')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const entries = {}
const chunks = []
const htmlWebpackPluginArray = []

glob.sync('./src/pages/**/app.js').forEach(path => {
  const chunk = path.split('./src/pages/')[1].split('/app.js')[0]
  entries[chunk] = path
  chunks.push(chunk)

  const filename = chunk + '.html'
  const htmlConf = {
    filename: filename,
    template: path.replace(/.js/g, '.html'),
    inject: 'body',
    favicon: './src/assets/img/logo.png',
    hash: true,
    chunks: ['commons', chunk],
    meta: {
      viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    }
  }
  htmlWebpackPluginArray.push(new HtmlWebpackPlugin(htmlConf))
})


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

const styleLoaderOptions = {
  loader: 'style-loader',
  options: {
    sourceMap: true
  }
}

const cssOptions = [{
  loader: 'css-loader',
  options: {
    sourceMap: true
  }
},
{
  loader: 'postcss-loader',
  options: {
    sourceMap: true
  }
}
]

module.exports = {
  entry: entries,
  output: {
    path: resolve(__dirname, '../docs'),
    filename: 'assets/js/[name].js',
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      assets: join(__dirname, '../src/assets'),
      components: join(__dirname, '../src/components')
    }
  },
  resolveLoader: {
    modules: ['node_modules', resolve(__dirname, 'loaders')]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV !== 'production'
            ? 'vue-style-loader'
            : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            root: resolve(__dirname, 'src'),
            attrs: ['img:src', 'link:href']
          }
        }]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|svgz)(\?.+)?$/,
        exclude: /favicon\.png$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'assets/img/[name].[hash:7].[ext]'
          }
        }]
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: "html-loader"
          },
          {
            loader: "markdown-loader"
          }
        ]
      },
      {
        test: /\.(ttf|otf)$/,
        use: [{
          loader: "fontmin-loader",
          options: {
            name: 'assets/fonts/[name].[ext]',
            text: scanCharacters().join(''),
          }
        }]
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 3,
          name: 'commons',
          enforce: true
        }
      }
    }
  },
  performance: {
    hints: false
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].css',
    }),
    ...htmlWebpackPluginArray
  ]
}

