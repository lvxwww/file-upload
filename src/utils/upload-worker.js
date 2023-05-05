/*
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-05-05 22:52:32
 */

const CHUNK_SIZE = 1024 * 1024;

if ("function" === typeof importScripts) {
  importScripts(
    "https://cdn.bootcdn.net/ajax/libs/spark-md5/3.0.2/spark-md5.js"
  );
  onmessage = (e) => {
    const { file } = e.data;
    console.time("生成hash");
    sliceFile(file);
  };

  function sliceFile(file) {
    const blobSlice =
      File.prototype.slice ||
      File.prototype.mozSlice ||
      File.prototype.webkitSlice;
    let spark = new SparkMD5.ArrayBuffer(),
      filerReader = new FileReader(),
      //切片数
      chunks_num = Math.ceil(file.size / CHUNK_SIZE),
      //当前处理的切片
      currentChunk = 0,
      //切片集合
      chunkList = [];
    filerReader.onload = function (e) {
      spark.append(e.target.result);
      if (currentChunk === chunks_num) {
        //发送回主线程
        postMessage({
          chunkList,
          file_hash: spark.end(),
        });
      }
    };

    filerReader.onerror = function (e) {
      console.log("something error");
    };

    //生成切片
    produceChunk();
    function produceChunk() {
      while (currentChunk < chunks_num) {
        let startByte = currentChunk * CHUNK_SIZE,
          //兼容最后一片的处理
          endByte =
            startByte + CHUNK_SIZE > file.size
              ? file.size
              : startByte + CHUNK_SIZE;
        const chunk = blobSlice.call(file, startByte, endByte);
        currentChunk++;
        chunkList.push(chunk);
        // 只在头尾两片进行hash
        if (currentChunk === 0 || currentChunk === chunks_num) {
          filerReader.readAsArrayBuffer(chunk);
        }
      }
    }
  }
}
