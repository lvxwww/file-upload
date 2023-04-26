/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-04-12 14:39:07
 */
const formidable = require("formidable");

module.exports = () => {
  return async function (ctx, next) {
    const form = formidable({
      multiples: true,
    });

    // eslint-disable-next-line promise/param-names
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
