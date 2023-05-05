/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-05-05 16:26:21
 */
const { checkHash, upload, merge } = require("../controllers");
// const { scmTest } = require('../schema/index');

const routes = [
  {
    method: "get",
    path: "/checkHash",
    // valid: scmTest.list,
    valid: "",
    controller: checkHash,
  },
  {
    method: "post",
    path: "/upload",
    // valid: scmTest.list,
    valid: "",
    controller: upload,
  },
  {
    method: "get",
    path: "/merge",
    // valid: scmTest.list,
    valid: "",
    controller: merge,
  },
];

module.exports = routes;
