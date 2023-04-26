/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-04-13 17:34:58
 */
module.exports = (paramSchema) => {
  return async function (ctx, next) {
    let body = ctx.request.body;
    // 是否出现错误的标记
    let is_error = false;
    const paramMap = {
      router: ctx.request.params,
      query: ctx.request.query,
      body,
    };

    if (!paramSchema) return next();
    const schemaKeys = Object.getOwnPropertyNames(paramSchema);
    if (!schemaKeys.length) return next();
    schemaKeys.some((item) => {
      const validObj = paramMap[item];

      const validResult = paramSchema[item].validate(validObj, {
        allowUnknown: true,
      });

      if (validResult.error) {
        is_error = true;
        ctx.body = ctx.utils.paramError(9998, validResult.error.message);
        ctx.status = 400;
      }
    });
    if (!is_error) {
      await next();
    }
  };
};
