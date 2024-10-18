const express = require('express');
const warehouse = express.Router();
const warehouseController = require('../controllers/warehouses.controller')

warehouse.post('/createWhs', warehouseController.createWhs)
warehouse.post('/editWhs', warehouseController.editWhs)
warehouse.post('/deleteWhs', warehouseController.deleteWhs)
module.exports = warehouse;