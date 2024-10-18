const express = require('express');
const Item = express.Router();
const itemController = require('../controllers/items.controller');

Item.post('/createItem', itemController.createItem)
Item.post('/editItem', itemController.editItem)
module.exports = Item;