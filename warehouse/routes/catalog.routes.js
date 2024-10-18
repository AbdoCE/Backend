const express = require('express');
const catalog = express.Router();
const catalogController = require('../controllers/catalogs.controller')

catalog.post('/createCat', catalogController.createCat)
catalog.post('/editCat', catalogController.editCat)
catalog.post('/deleteCat', catalogController.deleteCat)
module.exports = catalog;