const database = require('../../src/models/dbconnection')
const Logs = require('../../src/middlewares/logs/server.log');
const Create = require('../../src/middlewares/create');

const createItem = async (item_key, item_name, item_namesub, item_part, item_detail, cat_uuid, item_price, item_note, item_image, man_uuid) => {
    try {
        return new Promise((resolve, reject) => {

            const item_uuid = Create.uuid(); // tạo uuid

            const sql = "INSERT INTO `wh_items`(`item_uuid`, `item_key`, `item_name`, `item_namesub`, `item_part`, `item_detail`, `cat_uuid`, `item_price`, `item_note`, `item_image`, `item_status`, `item_serial`, `item_amount`, `whs_uuid`, `man_uuid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DEMO', 'DEMO', '-1','NULLWHS',?)";
            database.ConnectDatabase.query(sql, [item_uuid, item_key, item_name, item_namesub, item_part, item_detail, cat_uuid, item_price, item_note, item_image, man_uuid], (error, elements) => {

                if (error) {
                    //viết log khi lỗi 
                    Logs.writeErrLog("04mait", JSON.stringify(error))
                    return reject({ 'error': true, data: error });
                }

                return resolve({ 'error': false, data: elements });

            });

        });

    } catch (error) {
        //viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm createItem - mô tả:" + error)
        return false;
    }

}

///lấy thông tin

const getItem = async (key, value) => {
    try {
        const sql = "SELECT * FROM `wh_items` WHERE ?? = ?";
        const params = [key, value];
        
        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm khi lấy dữ liệu getItem - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements[0] });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm getItem - mô tả:" + error);
        return false;
    }
}

const getItemList = async () => {
    try {
        const sql = "SELECT * FROM `wh_items`;";
        
        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm getItemList khi lấy dữ liệu - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm getItemList - mô tả:" + error);
        return false;
    }
}

const getItemListCon = async (key, value) => {
    try {
        const sql = "SELECT * FROM `wh_items` WHERE ?? = ?";
        const params = [key, value];
        
        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm getItemListCon khi lấy dữ liệu - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm getItemListCon - mô tả:" + error);
        return false;
    }
}

const editItem = async (key, value, uuid) => {
    try {
        const sql = "UPDATE `wh_items` SET ?? = ? WHERE `wh_items`.`item_uuid` = ?";
        const params = [key, value, uuid];
        
        return new Promise((resolve, reject) => {
            database.ConnectDatabase.query(sql, params, (error, elements) => {
                if (error) {
                    // Viết log khi lỗi
                    Logs.writeErrLog("SQLDB", "Lỗi hàm khi sửa dữ liệu editItem - mô tả:" + error);
                    return reject({ 'error': true, data: error });
                }
                return resolve({ 'error': false, data: elements });
            });
        });
    } catch (error) {
        // Viết log khi lỗi
        Logs.writeErrLog("SQLDB", "Lỗi hàm eiditItem - mô tả:" + error);
        return false;
    }
}

const deleteItem = async (uuid) => {
    try {
        const sql = "DELETE FROM `wh_items` WHERE `wh_items`.`item_uuid` = ?";
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
    createItem,
    getItem,
    getItemList,
    editItem,
    getItemListCon,
    deleteItem
}