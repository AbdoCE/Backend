const fs = require('fs/promises');
const TF = require('../functions');
const crypto = require('crypto');
const writeLogs = async (user_uuid, action, info) => {
  try {
    const date = Date();
    const newlogs = {
      time: date,
      'user_uuid': user_uuid,
      'action': action,
      'info': info
    }
    // Tên tệp log
    const logFileName = 'src/middlewares/logs/server-logs.json';
    //thêm đại qq gì dô để nó tạo file
    await fs.appendFile(logFileName, " ")
    // Đọc dữ liệu từ tệp JSON hiện có (nếu có)
    let logs = [];
    const fileData = await fs.readFile(logFileName, 'utf-8');
    //kiểm tra xem chuỗi có phải json hay không
    if (TF.isValidJSON(fileData)) {
      logs = JSON.parse(fileData);
      logs.push(newlogs)
    } else {
      logs.push(newlogs)
    }
    // Chuyển đổi mảng logs thành chuỗi JSON
    const logsJson = JSON.stringify(logs, null, 2); // Thêm null, 2 để định dạng đẹp hơn
    // Ghi chuỗi JSON vào tệp
    await fs.writeFile(logFileName, logsJson, (err) => {
      if (err) {
        console.error('Lỗi khi ghi log vào tệp:', err);
      } else {
        console.log('Log mới đã được thêm vào tệp', logFileName);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

//Hàm này dành cho các lỗi mà server có thể gặp phải
const writeErrLog = async (errcode, content) => {
  try {
    const date = Date();
    const newlogs = {
      time: date,
      'errcode': errcode,
      'content': content
    }
    // Tên tệp log
    const logFileName = 'src/middlewares/logs/err.json';
    //thêm đại qq gì dô để nó tạo file
    await fs.appendFile(logFileName, " ")
    // Đọc dữ liệu từ tệp JSON hiện có (nếu có)
    let logs = [];
    const fileData = await fs.readFile(logFileName, 'utf-8');
    //kiểm tra xem chuỗi có phải json hay không
    if (TF.isValidJSON(fileData)) {
      logs = JSON.parse(fileData);
      logs.push(newlogs)
    } else {
      logs.push(newlogs)
    }
    // Chuyển đổi mảng logs thành chuỗi JSON
    const logsJson = JSON.stringify(logs, null, 2); // Thêm null, 2 để định dạng đẹp hơn
    // Ghi chuỗi JSON vào tệp
    await fs.writeFile(logFileName, logsJson, (err) => {
      if (err) {
        console.error('Lỗi khi ghi log vào tệp:', err);
      } else {
        console.log('Log mới đã được thêm vào tệp', logFileName);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

//lưu thông tin mấy cái đã xoá
const RecycleBin = async (user_uuid,action, info) => {
  try {
    const date = Date();
    const newlogs = {
      time: date,
      'user_uuid': user_uuid,
      'action' : action,
      'info': info
    }
    // Tên tệp log
    const logFileName = 'src/middlewares/logs/recyclebin.json';
    //thêm đại qq gì dô để nó tạo file
    await fs.appendFile(logFileName, " ")
    // Đọc dữ liệu từ tệp JSON hiện có (nếu có)
    let logs = [];
    const fileData = await fs.readFile(logFileName, 'utf-8');
    //kiểm tra xem chuỗi có phải json hay không
    if (TF.isValidJSON(fileData)) {
      logs = JSON.parse(fileData);
      logs.push(newlogs)
    } else {
      logs.push(newlogs)
    }
    // Chuyển đổi mảng logs thành chuỗi JSON
    const logsJson = JSON.stringify(logs, null, 2); // Thêm null, 2 để định dạng đẹp hơn
    // Ghi chuỗi JSON vào tệp
    await fs.writeFile(logFileName, logsJson, (err) => {
      if (err) {
        console.error('Lỗi khi ghi log vào tệp:', err);
      } else {
        console.log('Log mới đã được thêm vào tệp', logFileName);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  writeLogs,
  writeErrLog,
  RecycleBin,
}
