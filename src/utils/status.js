/*
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-04-17 23:24:28
 */
// 状态常量
const //初始状态
  START_STATUS = "start",
  //暂停状态
  PAUSE_STATUS = "pause",
  //进行中状态
  RUN_STATUS = "running",
  // 正常上传更新状态
  GOOD_UPDATE = "good_update",
  // 异常上传更新状态
  BAD_STATUS = "bad_status",
  // 完成状态
  FINISH_STATUS = "finish_status",
  // eventemitter 更新事件名
  // 更新进度条事件
  EVENT_PROGRESS = "event_progress",
  // 文件列表状态
  EVENT_FILE_STATUS = "event_file_status";

export {
  START_STATUS,
  PAUSE_STATUS,
  RUN_STATUS,
  GOOD_UPDATE,
  BAD_STATUS,
  FINISH_STATUS,
  EVENT_PROGRESS,
  EVENT_FILE_STATUS,
};
