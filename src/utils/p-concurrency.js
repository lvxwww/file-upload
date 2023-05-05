/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-05-05 16:09:56
 */
import { BAD_STATUS, EVENT_PROGRESS, EVENT_FILE_STATUS, RUN_STATUS, PAUSE_STATUS } from "./status.js";
//实现并发控制，且可以自由追加，需做的异步任务
// 并发数
const CONCURRENCY = 6;
//并发池
const request_pool = [];
//需做的任务队列
let task_list = [];
//暂停任务的队列
let pause_list = [];
// EvemtEmitter
let EE = "";
// 是否正在执行
let isRunning = false;

//将任务加入工作池
function add_task_to_pool(taskItem) {
  const { file_hash, fn: task, RetryCount } = taskItem || {};
  request_pool.push(task);
  task()
    .then((res) => {
      //执行完任务,将其从并发池中移除
      request_pool.splice(request_pool.indexOf(task), 1);
      // 通知更新进度条
      notifyUpdateProgress(file_hash);
      console.log("通知更新进度条");
    })
    .catch((err) => {
      console.log("something error!!!", err, task, taskItem);
      // 任务
      // 方案1 放在task_list头部
      // 方案2 放在task_list尾部
      // 查看是否已经到了最大次数
      RetryCount--;
      if (RetryCount > 0) {
        //执行完任务, 将其从并发池中移除;
        request_pool.splice(request_pool.indexOf(task), 1);
        // 重新把任务推到任务队列头部
        task_list.unshift(taskItem);
      } else {
        //将该任务状态改为错误，出现重试的按钮
        notifyUpdateFileList(file_hash, BAD_STATUS);
        pause_task(file_hash);
      }
    })
    .finally(() => {
      //增加新任务
      if (task_list.length > 0 && request_pool.length < CONCURRENCY) {
        add_task_to_pool(task_list.shift());
      }
    });
}

//开始任务
function start_task() {
  if (isRunning) return;
  while (request_pool.length < CONCURRENCY && task_list.length > 0) {
    add_task_to_pool(task_list.shift());
    isRunning = true;
  }
  isRunning = false;
}

//增加新任务
function add_task(taskList = []) {
  task_list.push(...taskList);
}

//暂停任务
function pause_task(file_hash) {
  //新的任务队列
  const new_task_list = [];
  const new_pause_list = task_list.filter((item) => {
    if (item["file_hash"] === file_hash) {
      return true;
    } else {
      new_task_list.push(item);
    }
  });

  task_list = new_task_list;
  pause_list = pause_list.concat(new_pause_list);
  notifyUpdateFileList(file_hash, PAUSE_STATUS);
}

//恢复任务
function regain_task(file_hash) {
  const new_pause_list = [];
  const regain_list = pause_list.filter((item) => {
    if (item["file_hash"] === file_hash) return true;
    new_pause_list.push(item);
  });
  add_task(regain_list);

  if (!isRunning) {
    start_task();
  }
  pause_list = new_pause_list;
  notifyUpdateFileList(file_hash, RUN_STATUS);
}

//取消任务
function cancel_task() {
  task_list = [];
}

//通知更新进度条
function notifyUpdateProgress(file_hash) {
  EE.emit(EVENT_PROGRESS, {
    file_hash,
  });
}

//通知更新文件列表状态
function notifyUpdateFileList(file_hash, type) {
  //更新文件列表状态
  EE.emit(EVENT_FILE_STATUS, {
    file_hash,
    type,
  });
}

//传递下EvemtEmitter
function setEvemtEmitter(_ee) {
  EE = _ee;
}

export {
  start_task,
  add_task,
  pause_task,
  regain_task,
  cancel_task,
  notifyUpdateProgress,
  notifyUpdateFileList,
  setEvemtEmitter,
};
