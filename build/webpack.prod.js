/*
 * @Author: lvxw lv81567395@vip.qq.com
 * @Date: 2023-03-30 23:13:24
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-03-30 23:39:47
 * @FilePath: /file-uploader-client/build/webpack.prod.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { merge } = require("webpack-merge");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const baseConfig = require("./webpack.base.js");
module.exports = merge(baseConfig, {
  mode: "production", // 生产模式,会开启tree-shaking和压缩代码,以及其他优化
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(), // 压缩css
      new TerserPlugin({
        // 压缩js
        parallel: true, // 开启多线程压缩
        terserOptions: {
          compress: {
            pure_funcs: ["console.log"], // 删除console.log
          },
        },
      }),
    ],
  },
});
