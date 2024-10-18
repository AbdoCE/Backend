const { request, response } = require("express");
const customerModel = require('../models/customer.model');
const Auth = require('../../src/middlewares/auth/auth.mid');
const logs = require('../../src/middlewares/logs/server.log');
const Create = require('../../src/middlewares/create');
const { json } = require("body-parser");
//tạo mới một Khách hàng
const createCus = async (req = request, res = response) => {
    try {
        //đọc dữ liệu gửi lên
        const { cus_name, cus_detail, cus_key } = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        //Kiểm tra xem người dùng đăng nhập hay chưa
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "add_customer");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        //kiểm tra xem có để trống cái nào không
        if (!cus_name || !cus_detail || !cus_key) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không để trống dữ liệu",
                data: "error_null"
            });
        }

        //lấy thông tin từ csdl xem đã tồn tại hay chưa
        const customerGet = await customerModel.getCustomer("cus_key", cus_key);

        if (customerGet.data) {
            return res.status(400).json({
                err: true,
                msg: "Mã của Khách hàng đã tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_key"
            })
        }

        const customerGetbyName = await customerModel.getCustomer("cus_name", cus_name);
        if (customerGetbyName.data) {
            return res.status(400).json({
                err: true,
                msg: "Tên của Khách hàng đã tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_name"
            })
        }
        //nếu chưa tồn tại thì thêm vào CSDL
        await customerModel.createCustomer(cus_name, cus_detail, cus_key)
        //kiểm tra xem trong data đã có hay chưa
        const checkCus = await customerModel.getCustomer("cus_key", cus_key);
        if (!checkCus.data) {
            logs.writeErrLog("02awa", JSON.stringify(error))
            return res.status(500).json({
                err: true,
                msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDCUSNULL",
                data: "ERRADDCUSNULL"
            })
        }
        logs.writeLogs(user_uuid, "createCus", content)
        return res.status(200).json({
            err: false,
            msg: "Thêm mới Khách hàng thành công",
            data: checkCus.data
        })

    } catch (error) {
        //thêm log 
        logs.writeErrLog("02awa", JSON.stringify(error))
        return res.status(500).json({
            err: true,
            msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDCUS",
            data: error
        })
    }
}

//chỉnh sửa một Khách hàng
const editCus = async (req = request, res = response) => {
    try {
        //đọc dữ liệu gửi lên
        const { cus_name, cus_detail, cus_key, cus_uuid } = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "edit_customer");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        //thông tin người dùng
        const user_uuid = isAuth.data.data[0].user_key
        //kiểm tra xem có để trống cái nào không
        if (!{ cus_name, cus_detail, cus_key, cus_uuid }) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không để trống dữ liệu",
                data: "error_null"
            })
        }
        //kiểm tra xem cái cat đang sửa có đang tồn tại hay không
        const customerGetuuid = await customerModel.getCustomer("cus_uuid", cus_uuid);
        //nếu đang không tồn tại => trả về lỗi
        if (!customerGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Khách hàng không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_uuid"
            })
        }
        const thisCus = customerGetuuid.data
        //Kiểm tra xem thông tin nào khác thông tin cũ
        /*Cách làm:
            -Tạo Sets chứa keys của 2 object
            -Lọc ra những phần tử có trong oldKeys nhưng không có trong newKeys
            -Nối với những phần tử có trong newKeys nhưng không có trong oldKeys
            -Kết quả là một Set chứa các keys khác nhau
            -Chuyển về mảng để hiển thị */
        //tạo object cho key chuẩn bị sửa
        const newCus = {
            'cus_name': cus_name,
            'cus_detail': cus_detail,
            'cus_key': cus_key,
        }
        //lấy allCus
        var allCus = await customerModel.getCusList()
        allCus = allCus.data;
        // 1. So sánh thisCus và newCus
        let diffKeys = [];
        // Lặp qua các keys trong thisCus
        Object.keys(thisCus).forEach(key => {

            // Nếu key không tồn tại trong newCus thì bỏ qua
            if (!newCus[key]) return;
            // So sánh giá trị, nếu khác nhau thêm vào mảng diff
            if (thisCus[key] !== newCus[key]) {
                diffKeys.push({ [key]: newCus[key] });
            }
        });
        //nếu không có cái nào thay đổi thì trả về lỗi luôn
        if (diffKeys.length < 1) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng phải thay đổi gì đó",
                data: "err_no_change"
            })
        }
        // Hàm để tìm các giá trị trùng nhau
        const duplicates = diffKeys.filter(diffKeyItem => allCus.some(allCusItem =>
            Object.keys(diffKeyItem).every(key => allCusItem[key] === diffKeyItem[key])
        ));
        //nếu có giá trị trùng nhau
        //trả về lỗi
        if (duplicates.length >= 1) {
            return res.status(400).json({
                err: true,
                msg: "Có một thành phần nào đó đã xuất hiện trong csdl, vui lòng kiểm tra lại",
                data: duplicates
            })
        }
        //nếu không có cái nào trùng
        const diffKeysObject = {};
        diffKeys.forEach(async (diffKeyItem) => {
            Object.keys(diffKeyItem).forEach(async (key) => {
                diffKeysObject[key] = diffKeyItem[key];
            });
        });

        ///gửi vào CSDL
        var _err = false
        Object.keys(diffKeysObject).forEach(async (key) => {
            var editCus = await customerModel.editCustomer(key, diffKeysObject[key], cus_uuid)
            if (editCus.err != true) {
                _err = true;
            }
        })
        if (_err === true) {
            return res.status(500).json({
                err: false,
                msg: "Có lỗi trong quá trình cập nhật Khách hàng",
                data: "edit_cus_err"
            })
        }
        const content = {
            oldCus: thisCus,
            updateCus: diffKeysObject
        }
        //thêm vào file log thông tin cập nhật để sau này còn tra lại
        logs.writeLogs(user_uuid, "updateCus", content)
        //Trả về OK
        return res.status(200).json({
            err: false,
            msg: "Chỉnh sửa Khách hàng thành công",
            data: "edit_cus_success"
        })

    } catch (error) {
        //thêm log 
        logs.writeErrLog("01eca", JSON.stringify(error))
        return res.status(500).json({
            err: true,
            msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDCUS",
            data: error
        })
    }
}
//hàm xoá (thực tế là chỉ ẩn nó đi ;))
const deleteCus = async (req = request,res = response) => {
    try {
        //đọc dữ liệu gửi lên
        const {cus_uuid} = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "delete_customer");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        //thông tin người dùng
        const user_uuid = isAuth.data.data[0].user_key
        //kiểm tra xem có để trống cái nào không
        if (!cus_uuid) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không để trống dữ liệu",
                data: "error_null"
            })
        }
        //kiểm tra xem cái cat đang sửa có đang tồn tại hay không
        const customerGetuuid = await customerModel.getCustomer("cus_uuid", cus_uuid);
        //nếu đang không tồn tại => trả về lỗi
        if (!customerGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Khách hàng không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_uuid"
            })
        }
        //lấy thông tin
        const thisCus = customerGetuuid.data
        //thêm vào thùng rác
        logs.RecycleBin(user_uuid,'delcus',thisCus)
        //xoá khỏi CSDL
        const deleteCus  =  await customerModel.deleteCustomer(cus_uuid);
        if (deleteCus.err) {
            logs.writeErrLog("01dca", JSON.stringify(error))
            return res.status(500).json({
                err: true,
                msg: "Có lỗi trong quá trình xoá dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi 01dca",
                data: error
            })
        }
        //Trả về OK
        return res.status(200).json({
            err: false,
            msg: "Xoá Khách hàng thành công",
            data: "delete_cus_success"
        })

    } catch (error) {
        console.log(err);
        logs.writeErrLog("01dca", JSON.stringify(error))
        return res.status(500).json({
            err: true,
            msg: "Có lỗi trong quá trình xoá dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi 01dca",
            data: error
        })
    }
}

module.exports = {
    createCus,
    editCus,
    deleteCus,
}