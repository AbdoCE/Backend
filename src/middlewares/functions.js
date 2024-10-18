const mysql = require('mysql');
//Chương trình kiểm tra có phải Json hay không
const isValidJSON = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

const isStringTooLong = (str, maxLength) => {
  return str.length > maxLength;
}
const escapeString = (str) => {
  return mysql.escape(str);
}

module.exports = {
  isValidJSON,
  isStringTooLong,
  escapeString
}