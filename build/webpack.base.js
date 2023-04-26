/*
 * @Author: lvxw lv81567395@vip.qq.com
 * @Date: 2023-03-30 23:12:54
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-04-12 00:39:25
 * @FilePath: /file-uploader-client/build/webpack.base.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// webpack.base.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

const isDev = process.env.NODE_ENV === "development";

module.exports = {
  entry: path.join(__dirname, "../src/index.jsx"), // 入口文件
  output: {
    filename: "static/js/[name].js", // 每个输出js的名称
    path: path.join(__dirname, "../dist"), // 打包结果输出路径
    clean: true, // webpack4需要配置clean-webpack-plugin来删除dist文件,webpack5内置了
    publicPath: "/", // 打包后文件的公共前缀路径
  },
  module: {
    rules: [
      {
        test: /.(js|jsx)$/, // 匹配jsx文件
        use: {
          loader: "babel-loader",
          options: {
            // 预设执行顺序由右往左,处理jsx
            presets: ["@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/, //匹配所有的 less 文件
        enforce: "pre",
        include: [path.resolve(__dirname, "../src")],
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
        ],
      },
      {
        test: /\.less$/, //匹配所有的 less 文件
        enforce: "pre",
        include: [path.resolve(__dirname, "../src")],
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "less-loader",
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: "asset",
        parser: {
          //转base64的条件
          dataUrlCondition: {
            maxSize: 10 * 1024, // 10kb
          },
        },
        generator: {
          filename: "static/images/[name].[contenthash:6][ext]",
        },
      },
      // {
      //   test: /\.worker\.js$/,
      //   use: { loader: "worker-loader" },
      //   options: { inline: true },
      // },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
    modules: [path.resolve(__dirname, "../node_modules")],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
      inject: true,
    }),
    // 抽离css插件
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:8].css",
    }),
  ],
  cache: {
    type: "filesystem", // 使用文件缓存
  },
};
