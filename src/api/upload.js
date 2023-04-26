/*
 * @Author: lvxw lv81567395@vip.qq.com
 * @Date: 2023-04-06 16:27:50
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-04-17 22:48:57
 * @FilePath: /file-uploader-client/src/api/upload.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from "axios";

const URL_PREFIX = "/api";

const api = {
  //上传切片接口
  // 参数 formData
  // file_hash, file_name, chunkNum (切片序号) ,chunk
  uploadChunk(opts) {
    return axios({
      url: URL_PREFIX + "/upload",
      method: "post",
      ...opts,
    });
  },

  //合并接口
  //参数
  // file_hash, file_name
  merge(data) {
    return axios({
      url: URL_PREFIX + "/merge",
      method: "get",
      params: data,
    });
  },

  //检查文件接口
  // 参数
  // file_hash, file_name
  checkFile(data) {
    return axios({
      url: URL_PREFIX + "/checkHash",
      method: "get",
      params: data,
    });
  },
};

export default api;
