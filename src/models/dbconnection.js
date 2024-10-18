const mysql = require('mysql');

//tạo kết nối đến cơ sở dữ liệu mysql
 const ConnectDatabase = mysql.createPool({
    host: "103.173.227.63",
    user: 'fahatech',
    database: 'clouddata',
    password: "#Thucvui02#"
 })

 module.exports = {
    ConnectDatabase,
 }