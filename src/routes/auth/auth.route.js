const express = require('express');
const auth = express.Router();
const authController = require('../../controllers/auth/auth.controller')
auth.post('/adduser', authController.addUser)
auth.post('/login', authController.loginUser)
auth.post('/logout', authController.logoutUser)

auth.get('/', (req, res) => {
	res.json({err: false, msg:"Auth đang hoạt động"});
});

module.exports = auth;