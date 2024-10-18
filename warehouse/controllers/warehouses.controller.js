const { request, response } = require("express");
const warehouseModel = require('../models/warehouse.model');
const Auth = require('../../src/middlewares/auth/auth.mid');
const logs = require('../../src/middlewares/logs/server.log');
const Create = require('../../src/middlewares/create');
const { json } = require("body-parser");
//tạo mới một Nhà kho
const createWhs = async (req = request, res = response) => {
    try {
        //đọc dữ liệu gửi lên
        const { whs_name, whs_detail, whs_key } = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        //Kiểm tra xem người dùng đăng nhập hay chưa
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "add_warehouse");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        //kiểm tra xem có để trống cái nào không
        if (!{ whs_name, whs_detail, whs_key }) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không để trống dữ liệu",
                data: "error_null"
            })
        }
        
        //lấy thông tin từ csdl xem đã tồn tại hay chưa
        const warehouseGet = await warehouseModel.getWarehouse("whs_key", whs_key);

        if (warehouseGet.data) {
            return res.status(400).json({
                err: true,
                msg: "Mã của Nhà kho đã tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_key"
            })
        }

        const warehouseGetbyName = await warehouseModel.getWarehouse("whs_name", whs_name);
        if (warehouseGetbyName.data) {
            return res.status(400).json({
                err: true,
                msg: "Tên của Nhà kho đã tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_name"
            })
        }
        //nếu chưa tồn tại thì thêm vào CSDL
        await warehouseModel.createWarehouse(whs_name, whs_detail, whs_key)
        //kiểm tra xem trong data đã có hay chưa
        const checkWhs = await warehouseModel.getWarehouse("whs_key", whs_key);
        if (!checkWhs.data) {
            logs.writeErrLog("02awa", JSON.stringify(error))
            return res.status(500).json({
                err: true,
                msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDWHSNULL",
                data: "ERRADDWHSNULL"
            })
        }
        return res.status(200).json({
            err: false,
            msg: "Thêm mới Nhà kho thành công",
            data: checkWhs.data
        })

    } catch (error) {
        //thêm log 
        logs.writeErrLog("02awa", JSON.stringify(error))
        return res.status(500).json({
            err: true,
            msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDWHS",
            data: error
        })
    }
}

//chỉnh sửa một Nhà kho
const editWhs = async (req = request, res = response) => {
    try {
        //đọc dữ liệu gửi lên
        const { whs_name, whs_detail, whs_key, whs_uuid } = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "edit_warehouse");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        //thông tin người dùng
        const user_uuid = isAuth.data.data[0].user_key
        //kiểm tra xem có để trống cái nào không
        if (!{ whs_name, whs_detail, whs_key, whs_uuid }) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không để trống dữ liệu",
                data: "error_null"
            })
        }
        //kiểm tra xem cái cat đang sửa có đang tồn tại hay không
        const warehouseGetuuid = await warehouseModel.getWarehouse("whs_uuid", whs_uuid);
        //nếu đang không tồn tại => trả về lỗi
        if (!warehouseGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Nhà kho không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_uuid"
            })
        }
        const thisWhs = warehouseGetuuid.data
        //Kiểm tra xem thông tin nào khác thông tin cũ
        /*Cách làm:
            -Tạo Sets chứa keys của 2 object
            -Lọc ra những phần tử có trong oldKeys nhưng không có trong newKeys
            -Nối với những phần tử có trong newKeys nhưng không có trong oldKeys
            -Kết quả là một Set chứa các keys khác nhau
            -Chuyển về mảng để hiển thị */
        //tạo object cho key chuẩn bị sửa
        const newWhs = {
            'whs_name': whs_name,
            'whs_detail': whs_detail,
            'whs_key': whs_key,
        }
        //lấy allWhs
        var allWhs = await warehouseModel.getWhsList()
        allWhs = allWhs.data;
        // 1. So sánh thisWhs và newWhs
        let diffKeys = [];
        // Lặp qua các keys trong thisWhs
        Object.keys(thisWhs).forEach(key => {

            // Nếu key không tồn tại trong newWhs thì bỏ qua
            if (!newWhs[key]) return;
            // So sánh giá trị, nếu khác nhau thêm vào mảng diff
            if (thisWhs[key] !== newWhs[key]) {
                diffKeys.push({ [key]: newWhs[key] });
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
        const duplicates = diffKeys.filter(diffKeyItem => allWhs.some(allWhsItem =>
            Object.keys(diffKeyItem).every(key => allWhsItem[key] === diffKeyItem[key])
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
            var editWhs = await warehouseModel.editWarehouse(key, diffKeysObject[key], whs_uuid)
            if (editWhs.err != true) {
                _err = true;
            }
        })
        if (_err === true) {
            return res.status(500).json({
                err: false,
                msg: "Có lỗi trong quá trình cập nhật Nhà kho",
                data: "edit_whs_err"
            })
        }
        const content = {
            oldWhs: thisWhs,
            updateWhs: diffKeysObject
        }
        //thêm vào file log thông tin cập nhật để sau này còn tra lại
        logs.writeLogs(user_uuid, "updateWhs", content)
        //Trả về OK
        return res.status(200).json({
            err: false,
            msg: "Chỉnh sửa Nhà kho thành công",
            data: "edit_whs_success"
        })

    } catch (error) {
        //thêm log 
        logs.writeErrLog("01eca", JSON.stringify(error))
        return res.status(500).json({
            err: true,
            msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDWHS",
            data: error
        })
    }
}
//hàm xoá (thực tế là chỉ ẩn nó đi ;))
const deleteWhs = async (req = request,res = response) => {
    try {
        //đọc dữ liệu gửi lên
        const {whs_uuid} = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "delete_warehouse");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        //thông tin người dùng
        const user_uuid = isAuth.data.data[0].user_key
        //kiểm tra xem có để trống cái nào không
        if (!whs_uuid) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không để trống dữ liệu",
                data: "error_null"
            })
        }
        //kiểm tra xem cái cat đang sửa có đang tồn tại hay không
        const warehouseGetuuid = await warehouseModel.getWarehouse("whs_uuid", whs_uuid);
        //nếu đang không tồn tại => trả về lỗi
        if (!warehouseGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Nhà kho không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_uuid"
            })
        }
        //lấy thông tin
        const thisWhs = warehouseGetuuid.data
        //thêm vào thùng rác
        logs.RecycleBin(user_uuid,'delwhs',thisWhs)
        //xoá khỏi CSDL
        const deleteWhs  =  await warehouseModel.deleteWarehouse(whs_uuid);
        if (deleteWhs.err) {
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
            msg: "Xoá Nhà kho thành công",
            data: "delete_whs_success"
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
    createWhs,
    editWhs,
    deleteWhs,
}