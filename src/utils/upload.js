/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-04-18 16:54:42
 */
import api from "../api/upload";
import pLimit from "./p-limit";
import { start_task, add_task, pause_task } from "./p-concurrency";

// 切片出错的请求重试次数
const RETRYCOUNT = 3;

//开始上传文件
async function upload(file) {
  if (!file) {
    return alert("出现错误了，请重新选择文件");
  }

  //获取切片和文件hash
  const { chunkList, file_hash } = await calculateHash(file);

  // 把hash返回，用于暂停和恢复
  return {
    file_hash,
    all_chunk_num: chunkList.length,
    finish_chunk_num: readyList.length,
    chunkList: new_chunkList,
    chunkRequestFn: () => {
      // 组装切片请求
      setChunkRequest(new_chunkList, file_hash);
    },
  };
}

//生成切片，和hash
function calculateHash(file) {
  return new Promise((resolve) => {
    const myWorker = new Worker(new URL("./upload-worker.js", import.meta.url));
    myWorker.postMessage({
      file,
    });
    myWorker.onmessage = (e) => {
      const { chunkList, file_hash } = e.data || {};
      resolve({ chunkList, file_hash });
    };
  });
}

//检查文件是否存在
async function checkFile(file_hash, file_name = "") {
  const {
    data: { data, code },
  } = await api.checkFile({
    file_hash,
    file_name,
  });
  // 判断是否文件已存在，存在则不用再上传
  //  code  0 文件未上传过  1 文件部分上传了  2 文件全部上传了
  if (code === 1) {
    return {
      sign: 1,
      ready_chunk_list: data?.chunk_list,
    };
  }

  return {
    sign: code,
  };
}

//组装切片请求
function setChunkRequest(chunkList, file_hash) {
  const request_list = chunkList.map((chunkItem) => {
    return {
      fn: () => asyncChunk(chunkItem, file_hash),
      file_hash,
    };
  });
  //添加任务
  add_task(request_list);
  start_task();
}

//切片请求
function asyncChunk(chunkItem, file_hash) {
  const { chunk, chunk_index } = chunkItem;
  // 生成formData
  const formData = new FormData();
  formData.append("chunk", chunk);
  formData.append("file_hash", file_hash);
  formData.append("chunkNum", chunk_index);
  return api.uploadChunk({
    data: formData,
  });
}

//检查切片
async function checkChunk(file_hash, file_name, chunkList) {
  if (!file_hash || !file_name) return;
  const { sign, ready_chunk_list: readyList = [] } = await checkFile(file_hash, file_name);
  if (+sign === 2) {
    alert(` ${file_name} 已存在，无需上传`);
    return {
      is_complete_file: true,
    };
  }
  // 过滤下已上传的切片
  let new_chunkList = [];
  chunkList.forEach((chunk, index) => {
    if (!readyList.includes(index + "")) {
      new_chunkList.push({
        chunk,
        hash_name: file_hash + "-" + index,
        RetryCount: RETRYCOUNT,
        chunk_index: index,
      });
    }
  });
  return {
    is_complete_file: false,
    new_chunkList,
  };
}

export { upload, calculateHash, checkChunk, setChunkRequest };
