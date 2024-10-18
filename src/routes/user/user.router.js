const express = require('express');
const user = express.Router();
const userController = require('../../controllers/user/user.controller')

user.post('/change_pass', userController.changePass)
user.get('/reset_pass', userController.resetPass)
user.post('/forgot_pass', userController.forgotPass)
user.get('/', (req, res) => {
	res.json({err: false, msg:"API user hoạt động"});
});

module.exports = user;