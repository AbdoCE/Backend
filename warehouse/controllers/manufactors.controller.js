const { request, response } = require("express");
const manufactorModel = require('../models/manufactor.model');
const Auth = require('../../src/middlewares/auth/auth.mid');
const logs = require('../../src/middlewares/logs/server.log');
const Create = require('../../src/middlewares/create');
const { json } = require("body-parser");
//tạo mới một Nhãn hàng
const createMan = async (req = request, res = response) => {
    try {
        //đọc dữ liệu gửi lên
        const { man_name, man_detail, man_key } = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        //Kiểm tra xem người dùng đăng nhập hay chưa
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "add_manufactor");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        const user_uuid = isAuth.data.data[0].user_key
        //kiểm tra xem có để trống cái nào không
        const requiredFields = ['man_name', 'man_detail', 'man_key'];
        const missingFields = requiredFields.filter(fieldName => {
            const fieldValue = req.body[fieldName];
            return !fieldValue;
        });
        if (missingFields.length > 0) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không để trống dữ liệu",
                data: missingFields.join(', ')
            });
        }

        //Kiểm tra xem dữ liệu nhập vào có dài quá hay không
        function isStringTooLong(value, maxLength) {
            return typeof value === 'string' && value.length > maxLength;
        }
        const maxLength = 100; // Đặt độ dài tối đa là 100 ký tự
        const fieldsToCheck = ['man_name', 'man_detail', 'man_key']; // Thay thế bởi danh sách các trường cần kiểm tra
        const fieldsTooLong = fieldsToCheck.filter(fieldName => {
            const fieldValue = req.body[fieldName];
            return isStringTooLong(fieldValue, maxLength);
        });
        if (fieldsTooLong.length > 0) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không nhập quá 100 ký tự",
                data: fieldsTooLong.join(', ')
            });
        }

        //lấy thông tin từ csdl xem đã tồn tại hay chưa
        const manufactorGet = await manufactorModel.getManufactor("man_key", man_key);

        if (manufactorGet.data) {
            return res.status(400).json({
                err: true,
                msg: "Mã của Nhãn hàng đã tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_key"
            })
        }

        const manufactorGetbyName = await manufactorModel.getManufactor("man_name", man_name);
        if (manufactorGetbyName.data) {
            return res.status(400).json({
                err: true,
                msg: "Tên của Nhãn hàng đã tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_name"
            })
        }
        //nếu chưa tồn tại thì thêm vào CSDL
        await manufactorModel.createManufactor(man_name, man_detail, man_key)
        //kiểm tra xem trong data đã có hay chưa
        const checkMan = await manufactorModel.getManufactor("man_key", man_key);
        if (!checkMan.data) {
            logs.writeErrLog("02awa", JSON.stringify(error))
            return res.status(500).json({
                err: true,
                msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDCUSNULL",
                data: "ERRADDCUSNULL"
            })
        }
        return res.status(200).json({
            err: false,
            msg: "Thêm mới Nhãn hàng thành công",
            data: checkMan.data
        })

    } catch (error) {
        //thêm log 
        console.log(error);
        logs.writeErrLog("02amaa", JSON.stringify(error))
        return res.status(500).json({
            err: true,
            msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDCUS",
            data: error
        })
    }
}

//chỉnh sửa một Nhãn hàng
const editMan = async (req = request, res = response) => {
    try {
        //đọc dữ liệu gửi lên
        const { man_name, man_detail, man_key, man_uuid } = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "edit_manufactor");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        //thông tin người dùng
        const user_uuid = isAuth.data.data[0].user_key
        //kiểm tra xem có để trống cái nào không
        if (!{ man_name, man_detail, man_key, man_uuid }) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không để trống dữ liệu",
                data: "error_null"
            })
        }
        //kiểm tra xem cái cat đang sửa có đang tồn tại hay không
        const manufactorGetuuid = await manufactorModel.getManufactor("man_uuid", man_uuid);
        //nếu đang không tồn tại => trả về lỗi
        if (!manufactorGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Nhãn hàng không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_uuid"
            })
        }
        const thisMan = manufactorGetuuid.data
        //Kiểm tra xem thông tin nào khác thông tin cũ
        /*Cách làm:
            -Tạo Sets chứa keys của 2 object
            -Lọc ra những phần tử có trong oldKeys nhưng không có trong newKeys
            -Nối với những phần tử có trong newKeys nhưng không có trong oldKeys
            -Kết quả là một Set chứa các keys khác nhau
            -Chuyển về mảng để hiển thị */
        //tạo object cho key chuẩn bị sửa
        const newMan = {
            'man_name': man_name,
            'man_detail': man_detail,
            'man_key': man_key,
        }
        //lấy allMan
        var allMan = await manufactorModel.getManList()
        allMan = allMan.data;
        // 1. So sánh thisMan và newMan
        let diffKeys = [];
        // Lặp qua các keys trong thisMan
        Object.keys(thisMan).forEach(key => {

            // Nếu key không tồn tại trong newMan thì bỏ qua
            if (!newMan[key]) return;
            // So sánh giá trị, nếu khác nhau thêm vào mảng diff
            if (thisMan[key] !== newMan[key]) {
                diffKeys.push({ [key]: newMan[key] });
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
        const duplicates = diffKeys.filter(diffKeyItem => allMan.some(allManItem =>
            Object.keys(diffKeyItem).every(key => allManItem[key] === diffKeyItem[key])
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
            var editMan = await manufactorModel.editManufactor(key, diffKeysObject[key], man_uuid)
            if (editMan.err != true) {
                _err = true;
            }
        })
        if (_err === true) {
            return res.status(500).json({
                err: false,
                msg: "Có lỗi trong quá trình cập nhật Nhãn hàng",
                data: "edit_man_err"
            })
        }
        const content = {
            oldMan: thisMan,
            updateMan: diffKeysObject
        }
        //thêm vào file log thông tin cập nhật để sau này còn tra lại
        logs.writeLogs(user_uuid, "updateMan", content)
        //Trả về OK
        return res.status(200).json({
            err: false,
            msg: "Chỉnh sửa Nhãn hàng thành công",
            data: "edit_man_success"
        })

    } catch (error) {
        //thêm log 
        console.log(error);
        logs.writeErrLog("01eca", JSON.stringify(error))
        return res.status(500).json({
            err: true,
            msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDCUS",
            data: JSON.stringify(error)
        })
    }
}
//hàm xoá (thực tế là chỉ ẩn nó đi ;))
const deleteMan = async (req = request, res = response) => {
    try {
        //đọc dữ liệu gửi lên
        const { man_uuid } = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "delete_manufactor");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        //thông tin người dùng
        const user_uuid = isAuth.data.data[0].user_key
        //kiểm tra xem có để trống cái nào không
        if (!man_uuid) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không để trống dữ liệu",
                data: "error_null"
            })
        }
        //kiểm tra xem cái cat đang sửa có đang tồn tại hay không
        const manufactorGetuuid = await manufactorModel.getManufactor("man_uuid", man_uuid);
        //nếu đang không tồn tại => trả về lỗi
        if (!manufactorGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Nhãn hàng không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_uuid"
            })
        }
        //lấy thông tin
        const thisMan = manufactorGetuuid.data
        //thêm vào thùng rác
        logs.RecycleBin(user_uuid, 'delman', thisMan)
        //xoá khỏi CSDL
        const deleteMan = await manufactorModel.deleteManufactor(man_uuid);
        if (deleteMan.err) {
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
            msg: "Xoá Nhãn hàng thành công",
            data: "delete_man_success"
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
    createMan,
    editMan,
    deleteMan,
}