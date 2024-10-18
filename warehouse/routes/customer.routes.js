const express = require('express');
const customer = express.Router();
const customerController = require('../controllers/customers.controller')

customer.post('/createCus', customerController.createCus)
customer.post('/editCus', customerController.editCus)
customer.post('/deleteCus', customerController.deleteCus)
module.exports = customer;