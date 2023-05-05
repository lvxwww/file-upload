/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-05-05 16:10:37
 */
const formidable = require("formidable");

module.exports = () => {
  return async function (ctx, next) {
    const form = formidable({
      multiples: true,
    });

    await new Promise((reslove, reject) => {
      form.parse(ctx.req, (err, fields, files) => {
        if (err) {
          reject(err);
        } else {
          ctx.request.body = fields;
          ctx.request.files = files;
          reslove();
        }
      });
    });

    await next();
  };
};
