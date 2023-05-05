/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-05-05 15:58:23
 */
import React from "react";
import {
  START_STATUS,
  PAUSE_STATUS,
  RUN_STATUS,
  FINISH_STATUS,
  BAD_STATUS,
} from "../../utils/status.js";
import { pause_task, regain_task } from "../../utils/p-concurrency.js";

const Index = ({ file_name = "", file_hash = "", file_status, percentage }) => {

  //处理状态文字显示
  function checkstatus(status) {
    let msg = "";
    switch (status) {
      case RUN_STATUS:
        msg = "上传中。。。";
        break;
      case PAUSE_STATUS:
        msg = "当前文件已停止上传！！！";
        break;
      case BAD_STATUS:
        msg = "文件上传出现异常，请重新选择上传！！！";
        break;
      case FINISH_STATUS:
        msg = "文件已经上传完成";
        break;
      default:
        break;
    }
    return msg;
  }

  //处理暂停和开始
  const handleRunorPause = () => {
    if (file_status === RUN_STATUS) {
      pause_task(file_hash);
    } else {
      regain_task(file_hash);
    }
  };

  return (
    <div className="file-upload-list-progress">
      <h5>
        {file_name} ---- {file_hash}
      </h5>
      <div className="flex f-y-c">
        <div className="progress-bg">
          <div
            className="progress-color"
            style={{ width: `${percentage ? percentage + "%" : "0"}` }}
          />
          <div className="progress-num">{percentage}%</div>
        </div>
        {file_status !== FINISH_STATUS ? (
          <div className="file-upload-list-progress-btns flex">
            {file_status !== START_STATUS ? (
              <div onClick={handleRunorPause}>
                {file_status === RUN_STATUS ? "暂停" : "继续"}
              </div>
            ) : null}
            <div>取消</div>
            <div>重试</div>
          </div>
        ) : null}
      </div>
      <div className="file-upload-status">{checkstatus(file_status)}</div>
    </div>
  );
};

export default Index;
