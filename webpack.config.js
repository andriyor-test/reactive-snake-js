const path = require("path");
const webpack = require("webpack");

const ROOT = path.resolve(__dirname, "src");
const DESTINATION = path.resolve(__dirname, "dist");

module.exports = {
  context: ROOT,
  entry: {
    main: "./main.js"
  },
  output: {
    filename: "[name].bundle.js",
    path: DESTINATION
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: [ROOT, "node_modules"]
  },
  mode: 'development',
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        use: "source-map-loader"
      },
    ]
  },

  devtool: "cheap-module-source-map",
  devServer: {}
};
