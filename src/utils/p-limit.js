/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-04-06 17:06:02
 */
//尝试实现pLimit(并发控制）
function pLimit(concurrency) {
  //正在执行的异步任务队列
  let task_queue = [],
    // 当前执行的任务数
    activeTaskCount = 0;

  //执行下一个任务
  const next = () => {
    activeTaskCount--;

    if (task_queue.length > 0) {
      task_queue.shift()();
    }
  };

  //执行异步任务
  const run_task = async (_fn, resolve, ...args) => {
    activeTaskCount++;

    const res = await _fn(...args);

    resolve(res);

    //执行下一个任务
    next();
  };

  //向队列推入任务
  const add_task = (_fn, resolve, ...args) => {
    task_queue.push(run_task.bind(null, _fn, resolve, ...args));

    //考虑 activeTaskCount更新不及时的问题 （直接等一个微任务）
    (async () => {
      //直接等一个微任务
      await Promise.resolve();
      //符合条件，就执行任务
      if (activeTaskCount < concurrency && task_queue.length > 0) {
        task_queue.shift()();
      }
    })();
  };

  //向外暴露的函数
  return function(_fn, ...args) {
    return new Promise((resolve) => {
      add_task(_fn, resolve, ...args);
    });
  };
}

export default pLimit;
