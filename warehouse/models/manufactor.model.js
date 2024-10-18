const database = require('../../src/models/dbconnection');
const Logs = require('../../src/middlewares/logs/server.log');
const Create = require('../../src/middlewares/create');
const mysql = require('mysql');

const createManufactor = async (man_name, man_detail, man_key) => {
    try {
        const man_uuid = Create.uuid();
        const sql = "INSERT INTO `wh_manufactors`(`man_name`, `man_detail`, `man_key`, `man_uuid`, `man_enable`) VALUES (?, ?, ?, ?, '1')";
        const params = [man_name, man_detail, man_key, man_uuid];

        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("04macu", JSON.stringify(error));
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm createManufactor - mô tả:" + error);
        return false;
    }
}

const getManufactor = async (key, value) => {
    try {
        const sql = "SELECT * FROM `wh_manufactors` WHERE ?? = ?";
        const params = [key, value];

        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm khi lấy dữ liệu getManufactor - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements[0] });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm getManufactor - mô tả:" + error);
        return false;
    }
}

const getManList = async () => {
    try {
        const sql = "SELECT * FROM `wh_manufactors`;";

        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm getManList khi lấy dữ liệu - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm getManList - mô tả:" + error);
        return false;
    }
}

const getManListCon = async (key, value) => {
    try {
        const sql = "SELECT * FROM `wh_manufactors` WHERE ?? = ?";
        const params = [key, value];

        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm getManListCon khi lấy dữ liệu - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm getManListCon - mô tả:" + error);
        return false;
    }
}

const editManufactor = async (key, value, uuid) => {
    try {
        const sql = "UPDATE `wh_manufactors` SET ?? = ? WHERE `wh_manufactors`.`man_uuid` = ?";
        const params = [key, value, uuid];

        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm khi sửa dữ liệu editManufactor - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm editManufactor - mô tả:" + error);
        return false;
    }
}

const deleteManufactor = async (uuid) => {
    try {
        const sql = "DELETE FROM `wh_manufactors` WHERE `wh_manufactors`.`man_uuid` = ?";
        const params = [uuid];

        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("02mdwa", JSON.stringify(error));
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("02mdwa", JSON.stringify(error));
        return false;
    }
}

module.exports = {
    createManufactor,
    getManufactor,
    getManList,
    editManufactor,
    getManListCon,
    deleteManufactor
}
