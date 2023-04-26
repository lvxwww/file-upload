/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-04-10 15:32:43
 */

const paramError = (code = 9998, message) => {
  const err = {
    code,
    message,
  };
  return err;
};

module.exports = {
  paramError,
};
