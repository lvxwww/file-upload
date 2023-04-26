/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-04-12 14:59:47
 */
const bodyparser = require("koa-bodyparser");

const router = require("../router");
const formidable = require("./formidable");

//参数解析
// 文件参数的处理
const mdFormidable = formidable();
// post请求参数的处理
const mdKoaBody = bodyparser({
  enableTypes: ["json", "form", "text", "xml"],
  formLimit: "56kb",
  jsonLimit: "1mb",
  textLimit: "1mb",
  xmlLimit: "1mb",
  strict: true,
});

// 路由处理
const mdRoute = router.routes();
const mdRouterAllowed = router.allowedMethods();

module.exports = [mdFormidable, mdKoaBody, mdRoute, mdRouterAllowed];
