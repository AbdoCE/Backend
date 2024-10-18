const userModel = require("../../models/user/user.model")
const bcrypt = require('bcrypt');
const variables = require('../../middlewares/variables');
const authMethod = require('../auth/auth.method');
const randToken = require('rand-token')
const Create = require('../../middlewares/create');
const Logs = require('../../middlewares/logs/server.log');
const authMid = require('../../middlewares/auth/auth.mid');

/**
 * hàm này dùng để thêm một user mới vào cơ sở dữ liệu
 */
const addUser = async (req = request, res = response) => {
    try {
        //dữ liệu máy khách gửi lên//
        console.log(Create.uuid())
        var user_data = {
            user_name: String(req.body.user_name),
            user_password: String(req.body.user_password),
            user_fullname: String(req.body.user_fullname),
            user_email: String(req.body.user_email),
            user_logs: "createNew:" + Date.now() + "@"
        }
        //kiểm soát dữ liệu đầu vào xem người dùng có để trống hay không//
        if (!user_data.user_name) {
            return res.status(200).json({
                err: true,
                msg: "Tên người dùng đang để trống",
                data: "empty_username"
            })
        }
        if (!user_data.user_password) {
            return res.status(200).json({
                err: true,
                msg: "Mật khẩu người dùng đang để trống",
                data: "empty_userpassword"
            })
        }
        if (!user_data.user_fullname) {
            return res.status(200).json({
                err: true,
                msg: "Vui lòng nhập đầy đủ họ và tên",
                data: "empty_userfullname"
            })
        }
        if (!user_data.user_email) {
            return res.status(200).json({
                err: true,
                msg: "Email người dùng đang để trống!",
                data: "empty_useremail"
            })
        }

        //không cho nhập ký tự đặc biệt vào tên người dùng
        if (!user_data.user_name.match(/^[A-Za-z0-9]+$/)) {
            return res.status(200).json({
                err: true,
                msg: "Chỉ được dùng chữ cái A-Z, a-z,số 0-9 vui lòng kiếm tra lại.",
                data: "error_username"
            })
        }
        // Kiểm tra xem có ký tự lạ trong tên hay khômg
        if (!(user_data.user_fullname.replace(/\s/g, "")).match(variables.reunicode)) {
            return res.status(200).json(
                {
                    err: true,
                    msg: "Vui lòng nhập đúng, bạn đang nhập sai, Họ và tên của bạn đang không đúng định dạng",
                    data: "error_fullname"
                })
        }
        // Check xem user có nhập 2 khoảng trắng không
        if (user_data.user_fullname.split('  ').length >= 2) {
            return res.status(200).json(
                {
                    err: true,
                    msg: "Vui lòng không nhập hai khoảng trắng, vui lòng kiểm tra lại",
                    data: "error_fullname_space"
                })
        }

        // kiểm xem mật khẩu có nhập linh tinh không
        if (!user_data.user_password.match(variables.passwordformat)) {
            return res.status(200).json({
                err: true,
                msg: "Mật khẩu không đúng định dạng vui lòng nhập lại. 8 đến 15 ký tự chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt " + user_data.user_password ,
                data: "error_password"
            })
        }
        //kiểm tra ký tự email
        
        if (!(variables.mailformat.test(user_data.user_email))) {
            return res.status(200).json({
                err: true,
                msg: "Vui lòng nhập đúng định dạng Email",
                data: "error_email"
            })
        }


        //kiểm tra sự tồn tại của một số thuộc tính duy nhất
        //kiểm tra xem tên người dùng có hay chưa
        var getUserInfo  = await userModel.getUserInfo('user_name', user_data.user_name)
        if (getUserInfo.data[0]) {
            return res.status(200).json({
                err: true,
                msg: "Tên người dùng đã tồn tại trong cơ sở dữ liệu",
                data: "arr_user_name"
            })
        }
        //kiểm tra xem email có tồn tại hay chưa
        var getUserInfo  = await userModel.getUserInfo('user_email', user_data.user_email)
        if (getUserInfo.data[0]) {
            return res.status(200).json({
                err: true,
                msg: "Email người dùng đã tồn tại trong cơ sở dữ liệu",
                data: "arr_user_email"
            })
        }
        //mã hoá thông tin 
        user_data.user_password = bcrypt.hashSync(user_data.user_password, 10) //mã hoá mật khẩu
        //thêm vào db
        await userModel.createUser(user_data)
        //kiểm tra db đã có dữ liệu hay chưa
        var getUserInfo_check  = await userModel.getUserInfo('user_name', user_data.user_name)
        if (!getUserInfo_check.data[0]) {
            return res.status(200).json({
                err: true,
                msg: "Chưa thấy thông tin trong cơ sở dữ liệu",
                data: "err_null"
            })
        }
        //trả kết quả thành công
        return res.status(200).json({
            err: false,
            msg: "Thêm tài khoản mới thành công",
            data: user_data,
        })
    } catch (error) {
        res.status(500).json({
            err: true,
            messenger: 'Lỗi hàm addUser',
            data: { error }
        })
    }
}

/**
 * Hàm kiểm tra đăng nhập
 */
const loginUser = async (req = request, res = response) => {
	try {

		//truy vấn thông tin gửi lên
		var user_data = {
			user_password: req.body.user_password,
			user_email: req.body.user_email,
			user_deviceID : req.body.user_key
		}
		//Kiểm tra lại nội dung Client gửi lên
		if (!user_data.user_password) {
            return res.status(200).json({
                err: true,
                msg: "Mật khẩu người dùng đang để trống",
                data: "emty_userpassword"
            })
        }
        if (!user_data.user_email) {
            return res.status(200).json({
                err: true,
                msg: "Email người dùng đang để trống",
                data: "empty_useremail"
            })
        }
        // kiểm xem mật khẩu có nhập linh tinh không
        if (!user_data.user_password.match(variables.passwordformat)) {
            return res.status(200).json({
                err: true,
                msg: "Mật khẩu không đúng định dạng vui lòng nhập lại. 8 đến 15 ký tự chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt",
                data: "error_password"
            })
        }
        //kiểm tra ký tự email
        
        if (!(variables.mailformat.test(user_data.user_email))) {
            return res.status(200).json({
                err: true,
                msg: "Vui lòng nhập đúng định dạng Email",
                data: "error_email"
            })
        }

		//Xác thực user, lấy thông tin user bằng Email
		const getUserInfo = await userModel.getUserInfo("user_email",user_data.user_email);
        const userInfo = getUserInfo.data[0]
		if (!userInfo) {
            return res.status(200).json({
                err: true,
                msg: "Email không tồn tại trong cơ sở dữ liệu",
                data: "error_email_empty"
            })
		}
        //kiểm tra mật khẩu nhập vào có khớp với mật khẩu đã mã hoá lưu trong csdl hay không
		const isPasswordValid = bcrypt.compareSync(user_data.user_password, userInfo.user_password);
		if (!isPasswordValid) {
			return res.status(200).json({
                err: true,
                msg: "Mật khẩu không khớp",
                data: "error_password_notmacth"
            })
		}
        //tạo token
		const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;//thời hạn token
		const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;//mã bí mật lưu ở server
        //tạo ra một đoạn id cho trình duyệt = mã phiên đăng nhập để xoá token của trình duyệt cũ
        const login_id = Create.uuid();
        //dữ liệu mà Token sẽ mang theo
		const dataForAccessToken = {
			user_name: userInfo.user_name,
            user_email: userInfo.user_email,
            user_loginid: login_id
		};
        //tạo token
		const accessToken = await authMethod.generateToken(
			dataForAccessToken,
			accessTokenSecret,
			accessTokenLife,
		);

        
		if (!accessToken) {
			return res.status(200).json({
                err: true,
                msg: "Token lỗi",
                data: "error_token"
            })
		}

		var refreshToken = randToken.generate(100); // tạo 1 refresh token ngẫu nhiên

        // Nếu user này chưa có refresh token thì lưu refresh token đó vào database
		if (!userInfo.user_token) {
			await userModel.updateUser('user_token',refreshToken,'user_email',userInfo.user_email);
		} else {
			// Nếu user này đã có refresh token thì lấy refresh token đó từ database
			//refreshToken = user.user_token;
		}
		userInfo.user_token = "Mã bí mật (đã mã hoá)";
        //lấy mã phiên đăng nhập, sau đó gửi lên trình duyệt
        const updateUser = await userModel.updateUser('user_loginid', login_id, 'user_email', userInfo.user_email)
        if (updateUser.error != true) {
            return res.status(200).json({
                err: false,
                msg: 'Đăng nhập thành công.',
                accessToken,
                userInfo,
                user_loginid: login_id
            });
        } else {
            await Logs.writeErrLog('03lou',error)
        return res.status(500).json({
                err: false,
                msg: 'Có lỗi trong quá trình thực thi',
                data: "err_model"
            });
        }
		
	}
	catch (e) {
		await Logs.writeErrLog('03lou',error)
        return res.status(500).json({
            err: true,
            msg: "Máy chủ lỗi hàm loginAuth",
            data: e
        })
        
	}
	
};

//đăng xuất
const logoutUser = async (req = request, res = response) => {
    try {
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        const isAuth = await authMid.isAuth(accessTokenFromHeader);
        if (isAuth.err === true) {
            return res.status(200).json(isAuth)
        }
        //thông tin người dùng
        const user_uuid = isAuth.data.data[0].user_key
        //Xoá cái phiên đăng nhập đi
        const newLoginID = Create.uuid();
        const updateLoginID =  await userModel.updateUser('user_loginid',newLoginID,'user_key',user_uuid)
        if (updateLoginID.err) {
            return res.status(200).json({
                err: true,
                msg: "Máy chủ lỗi hàm logoutAuth",
                data: 'err_logout'
            })
        }
        return res.status(200).json({
            err: false,
            msg: 'Đăng xuất thành công.',
            data: "logout_ok"
        });

    } catch (error) {
        await Logs.writeErrLog('03lou',error)
        return res.status(500).json({
            err: true,
            msg: "Máy chủ lỗi hàm logoutAuth",
            data: e
        })
    }
 }

module.exports = {
    addUser,
    loginUser,
    logoutUser,
}