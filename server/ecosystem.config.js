/*
 * @Author: lvxw lv81567395@vip.qq.com
 * @Date: 2023-04-25 22:53:58
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-04-25 22:54:33
 * @FilePath: /file-upload-server/ecosystem.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = {
  apps: [
    {
      name: "file-upload-server",
      script: "./app/index.js",
    },
  ],
};
