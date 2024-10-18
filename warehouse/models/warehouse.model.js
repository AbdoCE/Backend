const database = require('../../src/models/dbconnection');
const Logs = require('../../src/middlewares/logs/server.log');
const Create = require('../../src/middlewares/create');
const mysql = require('mysql');

const createWarehouse = async (whs_name, whs_detail, whs_key) => {
    try {
        const whs_uuid = Create.uuid();
        const sql = "INSERT INTO `wh_warehouses`(`whs_name`, `whs_detail`, `whs_key`, `whs_uuid`, `whs_enable`) VALUES (?, ?, ?, ?, '1')";
        const params = [whs_name, whs_detail, whs_key, whs_uuid];

        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("01maca", JSON.stringify(error));
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm createWarehouse - mô tả:" + error);
        return false;
    }
}

const getWarehouse = async (key, value) => {
    try {
        const sql = "SELECT * FROM `wh_warehouses` WHERE ?? = ?";
        const params = [key, value];

        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm khi lấy dữ liệu getWarehouse - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements[0] });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm getWarehouse - mô tả:" + error);
        return false;
    }
}

const getWhsList = async () => {
    try {
        const sql = "SELECT * FROM `wh_warehouses`;";

        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm getWhsList khi lấy dữ liệu - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm getWhsList - mô tả:" + error);
        return false;
    }
}

const getWhsListCon = async (key, value) => {
    try {
        const sql = "SELECT * FROM `wh_warehouses` WHERE ?? = ?";
        const params = [key, value];

        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm getWhsListCon khi lấy dữ liệu - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm getWhsListCon - mô tả:" + error);
        return false;
    }
}

const editWarehouse = async (key, value, uuid) => {
    try {
        const sql = "UPDATE `wh_warehouses` SET ?? = ? WHERE `wh_warehouses`.`whs_uuid` = ?";
        const params = [key, value, uuid];

        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm khi sửa dữ liệu editWarehouse - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm editWarehouse - mô tả:" + error);
        return false;
    }
}

const deleteWarehouse = async (uuid) => {
    try {
        const sql = "DELETE FROM `wh_warehouses` WHERE `wh_warehouses`.`whs_uuid` = ?";
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
    createWarehouse,
    getWarehouse,
    getWhsList,
    editWarehouse,
    getWhsListCon,
    deleteWarehouse
}
