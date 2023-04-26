/*
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-04-15 22:55:29
 */
//统一封装请求
const request = ({ url, method = "post", data, headers = {}, onprogress }) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    Object.keys(headers).forEach((key) =>
      xhr.setRequestHeader(key, headers[key])
    );
    xhr.upload.onprogress = onprogress;
    xhr.send(data);
    xhr.onload = (e) => {
      resolve({
        data: e.target.response,
      });
    };
  });
};

export default request;
