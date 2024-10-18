const { request } = require("express");
const userModel = require("../../models/user/user.model")
const bcrypt = require('bcrypt')
const authMethod = require('../../middlewares/auth/auth.method')
const authMid = require('../../middlewares/auth/auth.mid');
const Logs = require('../../middlewares/logs/server.log');
const isAuth = async (accessTokenFromHeader, authKey) => {
	try {
		//kiểm tra xem đúng user đang đăng nhập hay không//
		var data_rs = {
			err: true,
			msg: "Lỗi không xác định",
			data: null,
		}
		//kiểm tra xem có tồn tại hay không
		if (!accessTokenFromHeader) {
			data_rs = {
				err: true,
				msg: "Token không tồn tại hoặc bị sai, vui lòng kiểm tra lại",
				data: "error_tokenvalid"
			}

			return data_rs;
		}
		const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET // lấy mã bí mật lưu trong ENV
		///xác thực
		const verified = await authMethod.verifyToken(accessTokenFromHeader, accessTokenSecret)
		//kiểm tra token còn dùng được hay không
		if (!verified) {
			data_rs = {
				err: true,
				msg: "Token không tồn tại hoặc bị hết hạn, vui lòng kiểm tra lại",
				data: "error_tokennotverifed"
			}
			return data_rs;
		}
		//lấy thông tin user từ đống token mới lấy được
		const userInfo = await userModel.getUserInfo("user_email", verified.payload.user_email)
		if (!userInfo) {
			data_rs = {
				err: true,
				msg: "Xác thực không thành công, tài khoản có vấn đề, tài khoản của bạn sẽ bị tạm khoá",
				data: "err_hacker"
			}
			return data_rs;
		}

		//kiểm tra xem phiên làm việc của token có ok hay không
		if (userInfo.data[0].user_loginid != verified.payload.user_loginid) {
			data_rs = {
				err: true,
				msg: "Phiên đăng nhập không hợp lệ",
				data: "err_loginid"
			}
			return data_rs;
		}
		//Kiểm tra xem có cần xác thực quyền hay không 
		if (!authKey) {
			///trả về thông tin user
			data_rs = {
				err: false,
				msg: "Xác thực thành công",
				data: userInfo
			}
			return data_rs;
		}
		//nếu cần xác thực thêm quyền thì kiểm tra xem user đang ở phân cấp nào, và có quyền trong phân cấp đó hay không
		else {
			var userRole = userInfo.data[0].user_role
			//kiểm tra xem có tồn tại hay không 
			if (!userRole) {
				data_rs = {
					err: true,
					msg: "Xác thực không thành công, có vấn đề đối với quyền hạn của bạn trong ứng dụng, quyền của bạn là rỗng!",
					data: "ERR_ROLE"
				}
				return data_rs;
			}
			//tra xem quyền của user có trong data hay không
			var roleList = await userModel.getRoleList();
			const Rolefound = (roleList.data).find(role => role.role_key === userRole);
			if (!Rolefound) {
				///nếu có vấn đề trả về lỗi
				data_rs = {
					err: true,
					msg: "Không tìm thấy phân quyền của bạn trong cơ sở dữ liệu.",
					data: "ROLENOTFOUND"
				}
				return data_rs;
			}
			//kiểm tra trong list phân quyền đó có cái quyền đang hỏi hay không
			const  Rights = Rolefound.role_rights.split(';')
			const Rightfound = Rights.find(right => right === authKey || right === 'super_permision');
			if (!Rightfound) {
				///nếu có vấn đề trả về lỗi
				data_rs = {
					err: true,
					msg: "Bạn không có quyền thực hiện thao tác này, vui lòng kiểm tra lại",
					data: "NOTPEMISSION"
				}
				return data_rs;
			}
			//nếu đã kiểm tra ok thì trả về thông tin user
			data_rs = {
				err: false,
				msg: "Xác thực thành công",
				data: userInfo
			}
			return data_rs;
		}

	} catch (error) {
		var data_rs = {
			err: true,
			msg: "Xác thực thất bại - Lỗi không xác định",
			data: error
		}
		//Viết vào log lỗi của máy chủ
		Logs.writeErrLog("ERRAUTH", "Lỗi hàm isAuth : " + error)
		return data_rs;
	}
}

module.exports = {
	isAuth
}