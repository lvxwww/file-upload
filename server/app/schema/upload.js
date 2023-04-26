/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-04-11 17:47:18
 */
const Joi = require("joi");

const checkHash = {
  query: Joi.object({
    file_hash: Joi.string().required(),
    file_name: Joi.string().required(),
  }),
};

const upload = {
  query: Joi.object({
    file_hash: Joi.string(),
    file_name: Joi.string().required(),
  }),
};

module.exports = {
  checkHash,
  upload,
};
