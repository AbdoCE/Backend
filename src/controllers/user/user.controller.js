const { request } = require("express");
const userModel = require("../../models/user/user.model")
const bcrypt = require('bcrypt')
const authMid = require('../../middlewares/auth/auth.mid');
const variables = require('../../middlewares/variables');
const authMethod = require('../../middlewares/auth/auth.method');
const Create = require('../../middlewares/create');
const mail = require('../../middlewares/mail/mail.Send');
const Logs = require('../../middlewares/logs/server.log');
//Chức năng đổi mật khẩu
const changePass = async (req = request, res = response) => {
	const userInput_oldpass = req.body.oldpass;
	const userInput_newpass = req.body.newpass;
	const userInput_cfnewpass = req.body.cfnewpass;
	//lấy token của người dùng trong header
	const accessTokenFromHeader = req.headers.x_authorization;
	//kiểm tra xác thực user
	const authUser = await authMid.isAuth(accessTokenFromHeader)

	if (authUser.err == true) {
		return res.status(400).json({
			err: true,
			msg: authUser.msg,
			data: authUser
		})
	}

	//kiểm tra các input đầu vào
	//hai cái mới để trống => không đổi gì
	if (!userInput_newpass && !userInput_cfnewpass) {
		return res.status(200).json({
			err: false,
			msg: "Không đổi gì cả",
			data: "success_nochange"
		})
	}
	//nhập một cái thì phải nhập cả 2
	if (!userInput_newpass) {
		return res.status(400).json({
			err: true,
			msg: "Vui lòng không để trống mật khẩu mới",
			data: "emty_cfnewpassword"
		})
	}
	if (!userInput_cfnewpass) {
		return res.status(400).json({
			err: true,
			msg: "Vui lòng xác nhận lại mật khẩu mới",
			data: "emty_cfnewpassword"
		})
	}
	if (!userInput_oldpass) {
		return res.status(400).json({
			err: true,
			msg: "Mật khẩu người dùng đang để trống",
			data: "empty_oldpassword"
		})
	}
	// kiểm xem mật khẩu có nhập linh tinh không
	if (!userInput_oldpass.match(variables.passwordformat)) {
		return res.status(400).json({
			err: true,
			msg: "Mật khẩu cũ không đúng định dạng vui lòng nhập lại. 8 đến 15 ký tự chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt",
			data: "error_oldpassword"
		})
	}
	if (!userInput_newpass.match(variables.passwordformat)) {
		return res.status(400).json({
			err: true,
			msg: "Mật khẩu mới không đúng định dạng vui lòng nhập lại. 8 đến 15 ký tự chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt",
			data: "error_newpassword"
		})
	}
	if (!userInput_cfnewpass.match(variables.passwordformat)) {
		return res.status(400).json({
			err: true,
			msg: "Mật khẩu mới không đúng định dạng vui lòng nhập lại. 8 đến 15 ký tự chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt",
			data: "error_cfnewpassword"
		})
	}
	//kiểm tra mật khẩu cũ có khớp hay không
	const isPasswordValid = bcrypt.compareSync(userInput_oldpass, authUser.data.data[0].user_password);
	if (!isPasswordValid) {
		return res.status(400).json({
			err: true,
			msg: "Mật khẩu cũ không khớp, vui lòng thử lại",
			data: "err_oldpass"
		})
	}

	//kiểm tra 2 mật khẩu mới có giống nhau hay không
	if (userInput_newpass != userInput_cfnewpass) {
		return res.status(400).json({
			err: true,
			msg: "Vui lòng kiểm tra lại mật khẩu mới, hai mật khẩu mới không khớp nhau",
			data: "err_cfnewpass"
		})
	}
	//kiểm tra xem mật khẩu mới với mật khẩu cũ có khớp nhau không
	const isOldNewPasswordValid = bcrypt.compareSync(userInput_newpass, authUser.data.data[0].user_password);
	if (isOldNewPasswordValid) {
		return res.status(400).json({
			err: true,
			msg: "Mật khẩu mới không được để giống mật khẩu cũ",
			data: "err_oldnewpass"
		})
	}

	//Tiến hành cập nhật mật khẩu mới, lưu vào logs
	var updateUser = await userModel.updateUser("user_password", bcrypt.hashSync(userInput_newpass, 10), "user_email", authUser.data.data[0].user_email)
	if (updateUser.error != true) {
		return res.status(200).json({
			err: false,
			msg: "Cập nhật mật khẩu mới thành công",
			data: "success_changepass"
		})
	}
	else {
		return res.status(400).json({
			err: false,
			msg: "Có lỗi xảy ra trong quá trình thực thi lệnh",
			data: "err_database"
		})
	}
}


//hàm xử lý sự kiện người dùng quên mật khẩu
/** Người dùng sẽ nhấn phải gửi một thông báo quên mật khẩu đến máy chủ - máy chủ sẽ yêu cầu người dùng nhập email vào ô => máy chủ tạo ra đoạn mật khẩu mới + mã đổi mật khẩu mới gửi vào email đó. */
const forgotPass = async (req = request, res = response) => {
	try {
		const { email } = req.body;
		//kiểm tra xem có để trống hay không
		if (!email) {
			return res.status(400).json({
				err: true,
				msg: "Vui lòng không để trống Email",
				data: "error_email"
			})
		}
		//tiến hành kiểm tra email có tồn tại trong cơ sở dữ liệu hay chưa
		const getUserInfo = await userModel.getUserInfo("user_email", email)
		const userInfo = getUserInfo.data[0]
		if (!userInfo) {
			return res.status(400).json({
				err: true,
				msg: "Email không tồn tại trong cơ sở dữ liệu",
				data: "error_email_empty"
			})
		}
		//Kiểm tra xem thằng user này đã quên mật khẩu mấy lần trong tháng 

		//Nếu vừa quên cách đây không lâu => cấm xài
		//tạo ra một đoạn mã đổi mật khẩu tự động
		payload = {
			user_email: email,
			user_cache: Create.uuid()
		}
		//lấy mấy cái lưu ở môi trường
		const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;//mã bí mật lưu ở server
		const token = await authMethod.generateToken(payload, accessTokenSecret, '5m')
		//gửi link đổi mật khẩu đến email người dùng
		const sendMail = 1//await mail.mailSend('okeynhat@gmail.com','Email thay đổi mật khẩu - FahaVietNam','Có vẻ như bạn đã quên mật khẩu của mình và đã gửi cho chúng tôi yêu cầu cấp lại mật khẩu. Nhấn vào liên kết dưới đây để được cấp lại mật khẩu. <a href= "http://localhost:3001/user/reset_pass?token='+token+'"> Cấp lại mật khẩu </a>')
		if(sendMail)
		{
			return res.status(200).json({
				err: true,
				msg: "Gửi yêu cầu thành công",
				data: token,
			})
		}
		//Logs.writeLogs('FOPS',"Email:"+email);
	} catch (error) {
		return res.status(500).json({
			err: true,
			msg: "Lỗi máy chủ",
			data: "500"
		})
		

	}

}


const resetPass = async (req = request, res = response) => {
	const { token } = req.query;
	//kiểm tra xem token có hợp lệ hay không
	const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET // lấy mã bí mật lưu trong ENV
	///xác thực
	const verified = await authMethod.verifyToken(token, accessTokenSecret)
	//kiểm tra token còn dùng được hay không
	if (!verified) {
		return res.status(500).json({
			err: true,
			msg: "Token không tồn tại hoặc bị hết hạn, vui lòng kiểm tra lại",
			data: "error_tokennotverifed"
		})
	}

	//kiểm tra token đã sử dụng hay chưa

	//nếu token tồn tại tiến hàng Reset Lại mật khẩu sau đó gửi về email
	const newPass = Math.random().toString(36).slice(-8) + "#N"

	//tạo ra đoạn mã + ngày tháng quên để lưu trữ///
	return res.status(200).json({
		err: false,
		msg: "Đổi mật khẩu thành công",
		data: newPass
	})
}

module.exports = {
	changePass,
	forgotPass,
	resetPass
}