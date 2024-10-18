const express = require('express');
const manufactor = express.Router();
const manufactorController = require('../controllers/manufactors.controller')

manufactor.post('/createMan', manufactorController.createMan)
manufactor.post('/editMan', manufactorController.editMan)
manufactor.post('/deleteMan', manufactorController.deleteMan)
module.exports = manufactor;