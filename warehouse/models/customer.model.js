const database = require('../../src/models/dbconnection');
const Logs = require('../../src/middlewares/logs/server.log');
const Create = require('../../src/middlewares/create');
const mysql = require('mysql');

const createCustomer = async (cus_name, cus_detail, cus_key) => {
    try {
        const cus_uuid = Create.uuid();
        const sql = "INSERT INTO `wh_customers`(`cus_name`, `cus_detail`, `cus_key`, `cus_uuid`, `cus_enable`) VALUES (?, ?, ?, ?, '1')";
        const params = [cus_name, cus_detail, cus_key, cus_uuid];
        
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
        Logs.writeErrLog("SQLDB", "Lỗi hàm createCustomer - mô tả:" + error);
        return false;
    }
}

const getCustomer = async (key, value) => {
    try {
        const sql = "SELECT * FROM `wh_customers` WHERE ?? = ?";
        const params = [key, value];
        
        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm khi lấy dữ liệu getCustomer - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements[0] });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm getCustomer - mô tả:" + error);
        return false;
    }
}

const getCusList = async () => {
    try {
        const sql = "SELECT * FROM `wh_customers`;";
        
        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm getCusList khi lấy dữ liệu - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm getCusList - mô tả:" + error);
        return false;
    }
}

const getCusListCon = async (key, value) => {
    try {
        const sql = "SELECT * FROM `wh_customers` WHERE ?? = ?";
        const params = [key, value];
        
        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm getCusListCon khi lấy dữ liệu - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm getCusListCon - mô tả:" + error);
        return false;
    }
}

const editCustomer = async (key, value, uuid) => {
    try {
        const sql = "UPDATE `wh_customers` SET ?? = ? WHERE `wh_customers`.`cus_uuid` = ?";
        const params = [key, value, uuid];
        
        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm khi sửa dữ liệu editCustomer - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm editCustomer - mô tả:" + error);
        return false;
    }
}

const deleteCustomer = async (uuid) => {
    try {
        const sql = "DELETE FROM `wh_customers` WHERE `wh_customers`.`cus_uuid` = ?";
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
    createCustomer,
    getCustomer,
    getCusList,
    editCustomer,
    getCusListCon,
    deleteCustomer
}
