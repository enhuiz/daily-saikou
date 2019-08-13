const { join, resolve } = require("path");
const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

const entries = {};
const htmlWebpackPluginArray = [];

glob.sync("./src/pages/**/app.js").forEach(path => {
  const chunk = path.split("./src/pages/")[1].split("/app.js")[0];
  const filename = chunk + ".html";
  entries[chunk] = path;

  htmlWebpackPluginArray.push(
    new HtmlWebpackPlugin({
      filename: filename,
      template: path.replace(/.js/g, ".html"),
      inject: "body",
      favicon: "./src/assets/img/logo.png",
      hash: true,
      chunks: ["commons", chunk],
      meta: {
        viewport:
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      }
    })
  );
});

module.exports = {
  entry: entries,
  output: {
    path: resolve(__dirname, "../docs"),
    filename: "assets/js/[name].js"
  },
  resolve: {
    extensions: [".js", ".vue"],
    alias: {
      assets: join(__dirname, "../src/assets"),
      components: join(__dirname, "../src/components")
    }
  },
  resolveLoader: {
    modules: ["node_modules", resolve(__dirname, "loaders")]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|svgz)(\?.+)?$/,
        exclude: /favicon\.png$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "assets/img/[name].[hash:7].[ext]"
            }
          }
        ]
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
        use: [
          {
            loader: "fontmin-loader",
            options: {
              name: "assets/fonts/[name].[ext]"
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: false,
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: "initial",
          minChunks: 3,
          name: "commons",
          enforce: true
        }
      }
    }
  },
  performance: {
    hints: false
  },
  plugins: [new VueLoaderPlugin(), ...htmlWebpackPluginArray]
};
