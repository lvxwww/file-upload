/*
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-04-22 20:50:32
 */
const Koa = require("koa");
const Router = require("koa-router");
const { koaBody } = require("koa-body");
const path = require("path");
// 请求格式
const jsonError = require("koa-json-error");
//参数校验
const utils = require("./common/utils");
const compose = require("koa-compose");
const MD = require("./middlewares/");
const port = "3000";

const app = new Koa();

app.use(compose(MD));

// app.use(async (ctx, next) => {
//   ctx.set("Access-Control-Allow-Origin", "*");
//   ctx.set("Access-Control-Allow-Headers", "Content-Type");
//   ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
//   await next();
// });

app.listen(port, () => {
  console.log(`应用已经启动，http://localhost:${port}`);
});
