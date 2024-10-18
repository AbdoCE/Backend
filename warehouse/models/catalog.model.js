const database = require('../../src/models/dbconnection')
const Logs = require('../../src/middlewares/logs/server.log');
const Create = require('../../src/middlewares/create');

const createCatalog = async (cat_name, cat_detail, cat_key) => {
    try {
        return new Promise((resolve, reject) => {
            const cat_uuid = Create.uuid()

            const sql = "INSERT INTO `wh_catalogs`(`cat_name`, `cat_detail`, `cat_key`, `cat_uuid`, `cat_enable`) VALUES (?, ?, ?, ?, ?)";

            database.ConnectDatabase.query(sql, [cat_name, cat_detail, cat_key, cat_uuid, 1], (error, elements) => {
                if (error) {
                    Logs.writeErrLog("01maca", JSON.stringify(error))
                    return reject({
                        'error': true,
                        data: error
                    });
                }

                return resolve({
                    'error': false,
                    data: elements
                });
            });
        });

    } catch (error) {
        Logs.writeErrLog("SQLDB", "Lỗi hàm createCatalog - mô tả:" + error);
        return false;
    }
}

const getCatalog = async (key, value) => {
    try {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM `wh_catalogs` WHERE ?? = ?";

            database.ConnectDatabase.query(sql, [key, value], (error, elements) => {
                if (error) {
                    Logs.writeErrLog("SQLDB", "Lỗi hàm getCatalog - mô tả:" + error);
                    return reject({
                        'error': true,
                        data: error
                    });
                }

                return resolve({
                    'error': false,
                    data: elements[0]
                });
            });
        });

    } catch (error) {
        Logs.writeErrLog("SQLDB", "Lỗi hàm getCatalog - mô tả:" + error);
        return false;
    }
}

const getCatList = async () => {

    try {
      return new Promise((resolve, reject) => {
      
        const sql = "SELECT * FROM `wh_catalogs`";
      
        database.ConnectDatabase.query(sql, (error, elements) => {
        
          if(error) {
            Logs.writeErrLog("SQLDB", "Lỗi hàm getCatList - mô tả:" + error);
            return reject({
              'error': true, 
              data: error
            });
          }
  
          return resolve({
            'error': false,
            data: elements
          });
  
        });
  
      });
  
    } catch (error) {
      Logs.writeErrLog("SQLDB", "Lỗi hàm getCatList - mô tả:" + error);
      return false;
    }
  
  }
  
  const getCatListCon = async (key, value) => {
  
    try {
      return new Promise((resolve, reject) => {
  
        const sql = "SELECT * FROM `wh_catalogs` WHERE ?? = ?";
  
        database.ConnectDatabase.query(sql, [key, value], (error, elements) => {
  
          if (error) {
            Logs.writeErrLog("SQLDB", "Lỗi hàm getCatListCon - mô tả:" + error);
            return reject({
              'error': true,
              data: error  
            });
          }
  
          return resolve({
            'error': false,
            data: elements
          });
  
        });
  
      });
  
    } catch (error) {
      Logs.writeErrLog("SQLDB", "Lỗi hàm getCatListCon - mô tả:" + error);
      return false;
    }
  
  }
  
  const editCatalog = async (key, value, uuid) => {
  
    try {
      return new Promise((resolve, reject) => {
  
        const sql = "UPDATE `wh_catalogs` SET ?? = ? WHERE `cat_uuid` = ?";
  
        database.ConnectDatabase.query(sql, [key, value, uuid], (error, elements) => {
  
          if (error) {
            Logs.writeErrLog("SQLDB", "Lỗi hàm editCatalog - mô tả:" + error);
            return reject({
              'error': true,
              data: error
            });
          }  
  
          return resolve({
            'error': false,
            data: elements
          });
  
        });
  
      });
  
    } catch (error) {
      Logs.writeErrLog("SQLDB", "Lỗi hàm editCatalog - mô tả:" + error);
      return false;
    }
  
  }
  
  const deleteCatalog = async (uuid) => {
  
    try {
      return new Promise((resolve, reject) => {
  
        const sql = "DELETE FROM `wh_catalogs` WHERE `cat_uuid` = ?";
  
        database.ConnectDatabase.query(sql, [uuid], (error, elements) => {
  
          if (error) {
            Logs.writeErrLog("01mdca", JSON.stringify(error));
            return reject({
              'error': true,
              data: error
            });
          }
  
          return resolve({
            'error': false,
            data: elements
          });
  
        });
  
      });
  
    } catch (error) {
      Logs.writeErrLog("01mdca", JSON.stringify(error));
      return false;
    }
  
  }
  
module.exports = {
    createCatalog,
    getCatalog,
    getCatList,
    editCatalog,
    getCatListCon,
    deleteCatalog
}