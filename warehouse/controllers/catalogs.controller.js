const { request, response } = require("express");
const catalogModel = require('../models/catalog.model');
const Auth = require('../../src/middlewares/auth/auth.mid');
const logs = require('../../src/middlewares/logs/server.log');
const Create = require('../../src/middlewares/create');
const { json } = require("body-parser");
const Func = require('../../src/middlewares/functions');
//tạo mới một danh mục
const createCat = async (req = request, res = response) => {
    try {
        //đọc dữ liệu gửi lên
        var { cat_name, cat_detail, cat_key } = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        //Kiểm tra xem người dùng đăng nhập hay chưa
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "add_catalog");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        //kiểm tra xem có để trống cái nào không
        const requiredFields = ['cat_name', 'cat_detail', 'cat_key'];
        const missingFields = [];
        requiredFields.forEach(field => {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        });
        if (missingFields.length > 0) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không để trống dữ liệu",
                data: missingFields.join(', ')
            });
        }
        //kiểm tra độ dài
        const maxStringLength = 130;
        const fieldsToCheck = ['cat_name', 'cat_detail', 'cat_key'];
        const invalidFields = fieldsToCheck.filter(fieldName => {
            const fieldValue = req.body[fieldName];
            return fieldValue && fieldValue.length > maxStringLength;
        });
        if (invalidFields.length > 0) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không nhập quá 130 ký tự",
                data: invalidFields
            });
        }
        //lấy thông tin từ csdl xem đã tồn tại hay chưa
        const catalogGet = await catalogModel.getCatalog("cat_key", cat_key);

        if (catalogGet.data) {
            return res.status(400).json({
                err: true,
                msg: "Mã của danh mục đã tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_key"
            })
        }

        const catalogGetbyName = await catalogModel.getCatalog("cat_name", cat_name);
        if (catalogGetbyName.data) {
            return res.status(400).json({
                err: true,
                msg: "Tên của danh mục đã tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_name"
            })
        }
        //nếu chưa tồn tại thì thêm vào CSDL
        await catalogModel.createCatalog(cat_name, cat_detail, cat_key)
        //kiểm tra xem trong data đã có hay chưa
        const checkCat = await catalogModel.getCatalog("cat_key", cat_key);
        if (!checkCat.data) {
            return res.status(500).json({
                err: true,
                msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDCATNULL",
                data: "ERRADDCATNULL"
            })
        }
        return res.status(200).json({
            err: false,
            msg: "Thêm mới danh mục thành công",
            data: checkCat.data
        })

    } catch (error) {
        //thêm log 
        logs.writeErrLog("01aca", JSON.stringify(error))
        return res.status(500).json({
            err: true,
            msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDCAT",
            data: error
        })
    }
}

//chỉnh sửa một danh mục
const editCat = async (req = request, res = response) => {
    try {
        //đọc dữ liệu gửi lên
        var { cat_name, cat_detail, cat_key, cat_uuid } = req.body;
        Func.escapeString({ cat_name, cat_detail, cat_key, cat_uuid })
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "edit_catalog");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        //thông tin người dùng
        const user_uuid = isAuth.data.data[0].user_key
        //kiểm tra xem có để trống cái nào không
        if (!{ cat_name, cat_detail, cat_key, cat_uuid }) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không để trống dữ liệu",
                data: "error_null"
            })
        }

        if (Func.isStringTooLong({ cat_name, cat_detail, cat_key, cat_uuid }, 150)) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không nhập dữ liệu quá dài",
                data: "error_lenght"
            })
        }
        //kiểm tra xem cái cat đang sửa có đang tồn tại hay không
        const catalogGetuuid = await catalogModel.getCatalog("cat_uuid", cat_uuid);
        //nếu đang không tồn tại => trả về lỗi
        if (!catalogGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Danh mục không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_uuid"
            })
        }
        const thisCat = catalogGetuuid.data
        //Kiểm tra xem thông tin nào khác thông tin cũ
        /*Cách làm:
            -Tạo Sets chứa keys của 2 object
            -Lọc ra những phần tử có trong oldKeys nhưng không có trong newKeys
            -Nối với những phần tử có trong newKeys nhưng không có trong oldKeys
            -Kết quả là một Set chứa các keys khác nhau
            -Chuyển về mảng để hiển thị */
        //tạo object cho key chuẩn bị sửa
        const newCat = {
            'cat_name': cat_name,
            'cat_detail': cat_detail,
            'cat_key': cat_key,
        }
        //lấy allCat
        var allCat = await catalogModel.getCatList()
        allCat = allCat.data;
        // 1. So sánh thisCat và newCat
        let diffKeys = [];
        // Lặp qua các keys trong thisCat
        Object.keys(thisCat).forEach(key => {

            // Nếu key không tồn tại trong newCat thì bỏ qua
            if (!newCat[key]) return;
            // So sánh giá trị, nếu khác nhau thêm vào mảng diff
            if (thisCat[key] !== newCat[key]) {
                diffKeys.push({ [key]: newCat[key] });
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
        const duplicates = diffKeys.filter(diffKeyItem => allCat.some(allCatItem =>
            Object.keys(diffKeyItem).every(key => allCatItem[key] === diffKeyItem[key])
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
            var editCat = await catalogModel.editCatalog(key, diffKeysObject[key], cat_uuid)
            if (editCat.err != true) {
                _err = true;
            }
        })
        if (_err === true) {
            return res.status(500).json({
                err: false,
                msg: "Có lỗi trong quá trình cập nhật danh mục",
                data: "edit_cat_err"
            })
        }
        const content = {
            oldCat: thisCat,
            updateCat: diffKeysObject
        }
        //thêm vào file log thông tin cập nhật để sau này còn tra lại
        logs.writeLogs(user_uuid, "updateCat", content)
        //Trả về OK
        return res.status(200).json({
            err: false,
            msg: "Chỉnh sửa danh mục thành công",
            data: "edit_cat_success"
        })

    } catch (error) {
        //thêm log 
        logs.writeErrLog("01eca", JSON.stringify(error))
        return res.status(500).json({
            err: true,
            msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDCAT",
            data: error
        })
    }
}
//hàm xoá (thực tế là chỉ ẩn nó đi ;))
const deleteCat = async (req = request, res = response) => {
    try {
        //đọc dữ liệu gửi lên
        const { cat_uuid } = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "delete_catalog");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        //thông tin người dùng
        const user_uuid = isAuth.data.data[0].user_key
        //kiểm tra xem có để trống cái nào không
        if (!cat_uuid) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không để trống dữ liệu",
                data: "error_null"
            })
        }
        //kiểm tra xem cái cat đang sửa có đang tồn tại hay không
        const catalogGetuuid = await catalogModel.getCatalog("cat_uuid", cat_uuid);
        //nếu đang không tồn tại => trả về lỗi
        if (!catalogGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Danh mục không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_uuid"
            })
        }
        //lấy thông tin
        const thisCat = catalogGetuuid.data
        //thêm vào thùng rác
        logs.RecycleBin(user_uuid, 'delcat', thisCat)
        //xoá khỏi CSDL
        const deleteCat = await catalogModel.deleteCatalog(cat_uuid);
        if (deleteCat.err) {
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
            msg: "Xoá danh mục thành công",
            data: "delete_cat_success"
        })

    } catch (error) {
        logs.writeErrLog("01dca", JSON.stringify(error))
        return res.status(500).json({
            err: true,
            msg: "Có lỗi trong quá trình xoá dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi 01dca",
            data: error
        })
    }
}

module.exports = {
    createCat,
    editCat,
    deleteCat,
}