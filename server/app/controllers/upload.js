/*
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-04-25 22:43:26
 */
const fs = require("fs");
const path = require("path");
const UPLOAD_DIR = path.resolve(__dirname, "..", "./public/upload");
const CHUNK_KEY = "chunk";
const COMPLETE_KEY = "complete";
//正则匹配 文件名中的hash
const HASH_REG = /[A-Za-z0-9]*/;
//匹配文件名中的序号
const FILE_NAME_NUM_REG = /(?<=\-)\d*/;

const FILE_SIZE = 1024 * 1024 * 1;

class UploadController {
  // 检查文件hash
  async checkHash(ctx) {
    checkHash(ctx);
  }
  // 接受文件切片
  async upload(ctx) {
    upload(ctx);
  }
  // 合并切片
  async merge(ctx) {
    merge(ctx);
  }
}

//返回上传文件存放路径
const getPath = (file_hash, type, extName = "") => {
  if (type === CHUNK_KEY) {
    return path.resolve(UPLOAD_DIR, "./file_chunk", `chunkDir-${file_hash}`);
  } else {
    return path.resolve(
      UPLOAD_DIR,
      "./complete_file",
      `${file_hash}${extName}`
    );
  }
};

//检查文件的hash
//返回参数
// code
//  0 - 文件未上传
//  1 - 文件部分上传
//  2 - 文件上传完毕
// chunk_list  已上传切片序号list
async function checkHash(ctx) {
  const { file_hash, file_name } = ctx.query;
  const extName = path.parse(file_name).ext;
  // 校验下参数
  // ctx.verifyParams({
  //   file_hash: { type: "string", required: true },
  // });
  //检查步骤
  // 1.检查，是否在 'app/public/upload/complete_file' 有相同hash的文件, 有则返回 当前文件已存在 ，无则往下
  // 2.检查，是否在 'app/public/upload/file_chunk' 有相同hash的文件切片, 有则返回 当前文件切片的序号数组，无则往下
  // 3.从未上传过

  const completefilePath = getPath(file_hash, COMPLETE_KEY, extName);
  //检查1
  if (fs.existsSync(completefilePath)) {
    ctx.body = {
      data: {
        message: "当前文件已存在 已存在 已存在 已存在 已存在!!!",
      },
      code: 2,
    };
    return;
  }

  // 检查2
  const chunkfilePath = getPath(file_hash, CHUNK_KEY);
  if (fs.existsSync(chunkfilePath)) {
    // 记录chunk 序号
    const chunk_list = makeUploadList(chunkfilePath, file_hash);

    if (chunk_list.length) {
      ctx.body = {
        data: {
          message: "当前文件已上传部分",
          chunk_list,
        },
        code: 1,
      };
      return;
    }
  }

  //检查3
  return (ctx.body = {
    data: {
      message: "当前文件未上传",
    },
    code: 0,
  });
}

// 上传文件
async function upload(ctx) {
  const { req, res } = ctx;
  const { file_hash, file_name, chunkNum } = ctx.request.body;
  const { chunk } = ctx.request.files;
  const chunkDir = path.resolve(
    UPLOAD_DIR,
    "./file_chunk",
    "chunkDir-" + file_hash
  );

  if (!fs.existsSync(chunkDir)) {
    await fs.mkdirSync(chunkDir);
  }

  await fs.renameSync(chunk.filepath, `${chunkDir}/${file_hash}-${chunkNum}`);
  res.status = 200;
  return (ctx.body = {
    code: 0,
    msg: "切片上传成功！！",
  });
}

// 合并切片
async function merge(ctx) {
  const {
    request: { query },
  } = ctx;
  const { file_hash, file_name } = query;
  const filePath = getPath(file_hash, CHUNK_KEY);
  const extName = path.parse(file_name).ext;
  if (fs.existsSync(filePath)) {
    //最终文件存放的路径
    const finish_path = path.resolve(
      UPLOAD_DIR,
      "./complete_file",
      `${file_hash}${extName}`
    );
    mergeFileChunk(filePath, finish_path);
    ctx.body = {
      code: 0,
      msg: "文件切片合并成功！！！",
    };
    return;
  }

  ctx.body = {
    code: 1,
    msg: "文件切片合并出错，请重试",
  };
}

//返回已上传的切片list
function makeUploadList(chunk_path, file_hash) {
  const chunk_list = [];
  fs.readdirSync(chunk_path).forEach((file) => {
    const chunk_name = path.parse(file).name;
    if (chunk_name.match(HASH_REG)[0] === file_hash) {
      chunk_list.push(chunk_name.match(FILE_NAME_NUM_REG)[0]);
    }
  });
  return chunk_list;
}

//合并切片
async function mergeFileChunk(file_path, finish_path) {
  const chunkNames = fs.readdirSync(file_path);
  // 重新排下序
  chunkNames &&
    chunkNames.sort(
      (a, b) => parseInt(a.split("-")[1]) - parseInt(b.split("-")[1])
    );
  await Promise.all(
    chunkNames.map((chunkName, index) => {
      const chunkPath = path.resolve(file_path, chunkName);
      return pipeStream(
        chunkPath,
        fs.createWriteStream(finish_path, {
          start: index * FILE_SIZE,
        })
      );
    })
  );
  await delay(5000);
  // //删除切片的暂时目录
  // fs.rmdirSync(file_path);
}

// 写入文件流
function pipeStream(filePath, writeStream) {
  new Promise((resolve) => {
    // 创建可读流，读取所有切片
    const readStream = fs.createReadStream(filePath);
    readStream.on("end", () => {
      // 删除已读取的切片路径
      fs.unlinkSync(filePath);
      resolve();
    });
    //将可读流流入可写流
    readStream.pipe(writeStream);
  });
}

//定义延迟函数
function delay(interval) {
  typeof interval !== "number" ? (interval = 1000) : null;
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve();
    }, interval);
  });
}

module.exports = new UploadController();
