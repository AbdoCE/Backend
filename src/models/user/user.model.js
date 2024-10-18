const database = require('../dbconnection');
const Create = require('../../middlewares/create');
const mysql = require('mysql');
const util = require('util');

// Kết nối MySQL
const query = util.promisify(database.ConnectDatabase.query).bind(database.ConnectDatabase);

// Lấy thông tin bảng Users
const getUsers = async () => {
    try {
        const sql = "SELECT * FROM `users`";
        const rows = await query(sql);
        return rows;
    } catch (error) {
        return false;
    }
};

// Lấy thông tin một User nhất định với các thuộc tính cho trước
const getUserInfo = async (key, value) => {
    try {
        const sql = "SELECT * FROM `users` WHERE ?? = ?";
        const params = [key, value];
        const rows = await query(sql, params);
        return { 'error': false, data: rows };
    } catch (error) {
        return { 'error': true, data: error };
    }
};

// Thêm mới user
const createUser = async (user_data) => {
    try {
        const user_uuid = Create.uuid();
        const sql = "INSERT INTO `users`(`user_key`, `user_name`, `user_fullname`, `user_email`, `user_password`, `user_logs`) VALUES (?, ?, ?, ?, ?, ?)";
        const params = [user_uuid, user_data.user_name, user_data.user_fullname, user_data.user_email, user_data.user_password, user_data.user_logs];
        const result = await query(sql, params);
        return { 'error': false, data: result };
    } catch (error) {
        return { 'error': true, data: error };
    }
};

// Cập nhật dữ liệu vào User trên CSDL
const updateUser = async (key, value, wkey, wvalue) => {
    try {
        const sql = "UPDATE `users` SET ?? = ? WHERE ?? = ?";
        const params = [key, value, wkey, wvalue];
        const result = await query(sql, params);
        return { 'error': false, data: result };
    } catch (error) {
        return { 'error': true, data: error };
    }
};

// Lấy danh sách vai trò (roles)
const getRoleList = async () => {
    try {
        const sql = "SELECT * FROM `roles`;";
        const rows = await query(sql);
        return { 'error': false, data: rows };
    } catch (error) {
        return { 'error': true, data: error };
    }
};

module.exports = {
    getUsers,
    getUserInfo,
    createUser,
    updateUser,
    getRoleList,
};
