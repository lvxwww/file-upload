/*
 * @Author: lvxw lv81567395@vip.qq.com
 * @Date: 2023-04-03 22:32:22
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-04-26 21:23:13
 * @FilePath: /file-uploader-client/src/components/Upload/index.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useRef, useState, useEffect } from "react";
import EvemtEmitter3 from "eventemitter3";
import api from "../../api/upload";

import {
  upload,
  calculateHash,
  checkChunk,
  setChunkRequest,
} from "../../utils/upload";
import {
  pause_task,
  regain_task,
  cancel_task,
  setEvemtEmitter,
} from "../../utils/p-concurrency";
import ProgressItem from "../ProgressItem/index";
import {
  START_STATUS,
  PAUSE_STATUS,
  RUN_STATUS,
  GOOD_UPDATE,
  BAD_STATUS,
  FINISH_STATUS,
  EVENT_PROGRESS,
  EVENT_FILE_STATUS,
} from "../../utils/status.js";
import "./index.less";

const EE = new EvemtEmitter3();

//文件大小限制
const FILE_SIZE = 1024 * 1024 * 5;

export default function index() {
  // 当前的文件列表
  const [fileList, setFileList] = useState([]);
  // 需要当前处理的file
  const [curFile, setCurFile] = useState(null);

  //设置event事件
  useEffect(() => {
    setEvemtEmitter(EE);
    EE.on(EVENT_PROGRESS, handleUpdate);
    EE.on(EVENT_FILE_STATUS, handleStatus);
    return () => {
      EE.removeListener(EVENT_PROGRESS, handleUpdate);
      EE.removeListener(EVENT_FILE_STATUS, handleStatus);
    };
  }, [fileList]);

  //监听文件列表的更新
  useEffect(() => {
    if (curFile) {
      const { file_hash, file_name, chunkList } = curFile;
      //开始检查已上传切片，开始正式上传切片
      handleCheckChunk(file_hash, file_name, chunkList);
    }
  }, [curFile]);

  //增加文件上传中的提示弹窗
  useEffect(() => {
    //只有文件列表中文件状态不是完成态，则监听beforeunload
    if (fileList.some((item) => file_status !== FINISH_STATUS)) {
      window.addEventListener("beforeunload", handleUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [fileList]);

  const handleUpdate = (e) => {
    const { file_hash } = e;
    updateProgress(file_hash);
  };

  const handleStatus = (e) => {
    const { file_hash, type } = e;
    console.log("触发了更新状态", file_hash);
    updateFileListStatus(file_hash, type);
  };

  //处理文件上传
  // 步骤
  //   1.先创建文件列表
  //   2.再检查已经上传的切片
  //   3.开始上传切片或文件秒传
  const handleUpload = async (e) => {
    for (let file of e.target.files) {
      // 获取hash,先创建文件列表
      const { chunkList, file_hash } = await calculateHash(file);

      initFileItem({
        file_hash: file_hash,
        file_name: file["name"],
        all_chunk_num: chunkList.length,
        chunkList,
        finish_chunk_num: 0,
      });
    }
  };

  //初始化文件项
  const initFileItem = (file_item) => {
    const { file_hash, file_name, chunkList } = file_item;
    const file_item_obj = {
      percentage: 0,
      finish_chunk_num: 0,
      file_status: START_STATUS,
      ...file_item,
    };
    setFileList((fileList) => {
      fileList.push(file_item_obj);
      return [...fileList];
    });
    setCurFile({ ...file_item_obj });
  };

  //检查切片
  const handleCheckChunk = async (file_hash, file_name, chunkList) => {
    const check_res = await checkChunk(file_hash, file_name, chunkList);
    const { is_complete_file, new_chunkList } = check_res;
    if (is_complete_file) {
      //文件已经上传完毕
      updateProgress(file_hash, true);
    } else {
      //开始上传
      startUpload(new_chunkList, file_hash);
    }
  };

  //更新进度条
  const updateProgress = async (file_hash = "", is_complete_file = false) => {
    if (!file_hash) return;

    const target_Index = fileList.findIndex(
      (_item) => _item.file_hash === file_hash
    );
    if (target_Index !== -1) {
      //更新进度
      const { all_chunk_num, file_status } = fileList[target_Index];
      const new_finish_chunk_num = is_complete_file
        ? all_chunk_num
        : ++fileList[target_Index]["finish_chunk_num"];
      //只有文件的上传进行状态才更新，进度条
      if (file_status === RUN_STATUS || file_status === START_STATUS) {
        fileList[target_Index]["percentage"] = parseInt(
          (new_finish_chunk_num / all_chunk_num) * 100
        );
        if (+fileList[target_Index]["percentage"] === 100) {
          const { file_name, file_hash } = fileList[target_Index];

          //已经有完整文件的
          if (is_complete_file) {
            fileList[target_Index]["file_status"] = FINISH_STATUS;
          } else {
            console.log("合并切片请求", file_hash);
            //触发合并切片请求
            const res = await merge(file_name, file_hash);
            if (+res.code === 0) {
              fileList[target_Index]["file_status"] = FINISH_STATUS;
            }
          }
        }
      }
      setFileList([...fileList]);
    }
  };

  //更新文件上传列表状态
  const updateFileListStatus = (file_hash, file_status = RUN_STATUS) => {
    const target_Index = fileList.findIndex(
      (_item) => _item.file_hash === file_hash
    );

    if (target_Index !== -1) {
      if (fileList[target_Index]["file_status"] !== file_status) {
        fileList[target_Index]["file_status"] = file_status;
        setFileList([...fileList]);
      }
    }
  };

  //更新文件上传列表的chunkList
  const updateFileListChunk = (new_chunkList, file_hash) => {
    const target_Index = fileList.findIndex(
      (_item) => _item.file_hash === file_hash
    );
    if (target_Index !== -1) {
      fileList[target_Index]["chunkList"] = [...new_chunkList];
      fileList[target_Index]["finish_chunk_num"] =
        fileList[target_Index]["all_chunk_num"] - new_chunkList.length;
      setFileList([...fileList]);
      //处理秒传
      if (new_chunkList.length === 0) {
        updateProgress(file_hash, true);
      }
    }
  };

  //合并切片
  const merge = (file_name, file_hash) => {
    return new Promise((resolve, reject) => {
      api
        .merge({ file_name, file_hash })
        .then((res) => {
          if (res.data) {
            resolve(res.data);
          } else {
            reject("something error!");
          }
        })
        .catch((err) => {
          reject("something error!");
        });
    });
  };

  //开始上传切片
  const startUpload = (chunkList, file_hash) => {
    //更新文件的列表状态
    updateFileListStatus(file_hash);
    // 更新文件列表的chunkList
    updateFileListChunk(chunkList, file_hash);
    //开始上传
    setChunkRequest(chunkList, file_hash);
  };

  //处理页面unload
  const handleUnload = (e) => {
    const tips = "可能不会保存您所做的更改!!";
    e.preventDefault();
    e.returnValue = tips;
    return tips;
  };

  return (
    <div className="file-upload">
      Upload
      <div className="file-upload-input">
        选择:
        <input type="file" onChange={handleUpload} multiple />
      </div>
      <div className="file-upload-list">
        <h6>文件列表</h6>
        {fileList?.length
          ? fileList.map((_item) => (
              <ProgressItem key={_item.file_hash} {..._item} />
            ))
          : null}
      </div>
    </div>
  );
}
