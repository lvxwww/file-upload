/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-05-05 16:26:01
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

app.use((ctx) => {
  ctx.body = "Welcome file-upload-server !!";
});

app.listen(port, () => {
  console.log(`应用已经启动，http://localhost:${port}`);
});
