const { request, response } = require("express");
const itemModel = require('../models/item.model');
const Auth = require('../../src/middlewares/auth/auth.mid');
const logs = require('../../src/middlewares/logs/server.log');
const Create = require('../../src/middlewares/create');
const Func = require('../../src/middlewares/functions');
const catalogModel = require('../models/catalog.model');
const manufactorModel = require('../models/manufactor.model');
const Variable = require('../../src/middlewares/variables');
const mysql = require('mysql');
const { json } = require("body-parser");
//Tạo mới sản phẩm
const createItem = async (req = request, res = response) => {
    //đây là hàm thêm mẫu sản phẩm vào kho, nó không có tác dụng thêm sản phẩm mới vào các khi, nó chỉ thêm phôi sản phẩm nên chỉ cần part và thông tin của sản phẩm => trạng thái sẽ là demo
    try {
        //đọc dữ liệu gửi lên
        var { item_key, item_name, item_namesub, item_part, item_detail, cat_uuid, item_price, item_note, item_image, man_uuid } = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        //Kiểm tra xem người dùng đăng nhập hay chưa
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "create_item");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        const user_uuid = isAuth.data.data[0].user_key
        //kiểm tra có dữ liệu nào bị bỏ trống hay không
        const requiredFields = ['item_key', 'item_name', 'item_namesub', 'item_part', 'item_detail', 'cat_uuid', 'item_price', 'item_note', 'item_image', 'man_uuid'];
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
        //kiểm tra xem có cái nào dài quá hay không
        item_key = item_key + "DM";
        if (Func.isStringTooLong(item_key, 100) ||
            Func.isStringTooLong(item_name, 100) ||
            Func.isStringTooLong(item_namesub, 100) ||
            Func.isStringTooLong(item_part, 100) ||
            Func.isStringTooLong(cat_uuid, 100) ||
            Func.isStringTooLong(item_price, 100) ||
            Func.isStringTooLong(item_image, 100) ||
            Func.isStringTooLong(man_uuid, 100)) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng không nhập liệu quá dài",
                data: "error_length"
            });
        }

        //lấy thông tin từ csdl xem đã tồn tại hay chưa
        const itemGetKey = await itemModel.getItem("item_key", item_key);
        if (itemGetKey.data) {
            return res.status(400).json({
                err: true,
                msg: "Mã của Sản phẩm đã tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_key"
            })
        }

        //kiểm tra xem danh mục đã tồn tại hay chưa
        const catalogGetuuid = await catalogModel.getCatalog("cat_uuid", cat_uuid);
        if (!catalogGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Danh mục sản phẩm không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_null_cat"
            })
        }
        //kiểm tra xem thương hiệu đã tồn tại hay chưa
        const manufactorGetuuid = await manufactorModel.getManufactor("man_uuid", man_uuid);
        if (!manufactorGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Nhãn hàng của sản phẩm không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_null_man"
            })
        }

        //kiểm tra xem part đã tồn tại hay chưa
        const itemGetPart = await itemModel.getItem("item_part", item_part);
        if (itemGetPart.data) {
            return res.status(400).json({
                err: true,
                msg: "Model của Sản phẩm đã tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_unique_key"
            })
        }
        //có 2 loại sản phẩm 1 là duy nhất tức là part giống nhau và Serial khác nhau, mấy món này công thức add cũng khác nhau - nên quy định hàng này là add new tức là thêm mẫu mã cho sản phẩm nên không cần nhập serial, chỉ cần kiểm xem model có tồn tại hay chưa thôi

        //thêm hàng vào csdl
        const createItem = await itemModel.createItem(item_key, item_name, item_namesub, item_part, item_detail, cat_uuid, item_price, item_note, item_image, man_uuid)
        if (createItem.err) {
            return res.status(500).json({
                err: true,
                msg: "Có lỗi trong quá trình thêm mới sản phẩm",
                data: createItem.data
            })
        }

        //lấy ngược lại từ CSDL sau đó trả về
        const checkItem = await itemModel.getItem("item_key", item_key);
        if (checkItem.err) {
            return res.status(500).json({
                err: true,
                msg: "Có lỗi trong quá trình thêm mới sản phẩm",
                data: checkItem.data
            })
        }
        logs.writeLogs(user_uuid, 'addItem', checkItem.data)
        return res.status(200).json({
            err: true,
            msg: "Thêm mới mẫu sản phẩm thành công",
            data: checkItem.data
        })

    } catch (error) {
        logs.writeErrLog('04ait', error)
        console.log(error);
        return res.status(500).json({
            err: true,
            msg: "Có lỗi phía máy chủ",
            data: error
        })
    }
}

const editItem = async (req = request, res = response) => {
    try {
        //đọc dữ liệu gửi lên
        var { item_name, item_namesub, item_part, item_detail, cat_uuid, item_price, item_note, item_image, item_uuid, man_uuid } = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "edit_item");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        //thông tin người dùng
        const user_uuid = isAuth.data.data[0].user_key
        //kiểm tra có dữ liệu nào bị bỏ trống hay không
        const requiredFields = ['item_name', 'item_namesub', 'item_part', 'item_detail', 'cat_uuid', 'item_price', 'item_note', 'item_image', 'man_uuid'];
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
                data: missingFields.join(',')
            });
        }
        //kiểm tra xem dữ liệu nhập có quá dài hay không
        const errorFields = [];

        const checkField = (fieldName, value, maxLength) => {
            if (!value || Func.isStringTooLong(value, maxLength)) {
                errorFields.push(fieldName);
            }
        }
        checkField('item_name', item_name, 150);
        checkField('item_namesub', item_namesub, 150);
        checkField('item_part', item_part, 150);
        checkField('cat_uuid', cat_uuid, 150);
        checkField('item_price', item_price, 150);
        checkField('item_uuid', item_uuid, 150);
        if (errorFields.length > 0) {
            return res.status(400).json({
                err: true,
                msg: "Vui lòng kiểm tra các trường dữ liệu lỗi.",
                data: errorFields.join(',')
            });
        }
        //kiểm tra xem cái item đang sửa có đang tồn tại hay không
        const itemGetuuid = await itemModel.getItem("item_uuid", item_uuid);
        //nếu đang không tồn tại => trả về lỗi
        if (!itemGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Sản phẩm không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_null_uuid"
            })
        }
        //kiểm tra xem cat_uuid có tồn tại không
        const catalogGetuuid = await catalogModel.getCatalog("cat_uuid", cat_uuid);
        if (!catalogGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Danh mục sản phẩm không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_null_cat"
            })
        }

        //kiểm tra xem man_uuid có tồn tại không
        const manufactorGetuuid = await manufactorModel.getManufactor("man_uuid", man_uuid);
        if (!manufactorGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Nhãn hàng của sản phẩm không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_null_man"
            })
        }
        const thisItem = itemGetuuid.data
        //đây là sp demo nên không cho phép sửa cái qq sn
        const newItem = {
            'item_name': item_name,
            'item_namesub': item_namesub,
            'item_part': item_part,
            'item_detail': item_detail,
            'cat_uuid': cat_uuid,
            'item_price': item_price,
            'item_note': item_note,
            'item_image': item_image,
            'man_uuid': man_uuid
        };

        //lấy allItem
        var allItem = await itemModel.getItemList()
        allItem = allItem.data;
        // 1. So sánh thisItem và newItem
        let diffKeys = [];
        // Lặp qua các keys trong thisItem
        Object.keys(thisItem).forEach(async (key) => {
            // Nếu key không tồn tại trong newItem thì bỏ qua
            if (!newItem[key]) return;
            // So sánh giá trị, nếu khác nhau thêm vào mảng diff
            //nếu có kiểm tra xem có tồn tại hay không
            if (thisItem[key] !== newItem[key]) {
                diffKeys.push({ [key]: newItem[key] });
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
        //Tìm xem cat uuid có thay đổi hay không
        // Hàm để tìm các giá trị trùng nhau
        const duplicates = diffKeys.filter(diffKeyItem => allItem.some(allItemItem =>
            Object.keys(diffKeyItem).every(key => allItemItem[key] === diffKeyItem[key])
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
            var editItem = await itemModel.editItem(key, diffKeysObject[key], item_uuid)
            if (editItem.err != true) {
                _err = true;
            }
        })
        if (_err === true) {
            return res.status(500).json({
                err: false,
                msg: "Có lỗi trong quá trình cập nhật Sản phẩm",
                data: "edit_item_err"
            })
        }
        const content = {
            oldItem: thisItem,
            updateItem: diffKeysObject
        }
        //thêm vào file log thông tin cập nhật để sau này còn tra lại
        logs.writeLogs(user_uuid, "updateItem", content)
        //Trả về OK
        return res.status(200).json({
            err: false,
            msg: "Chỉnh sửa Sản phẩm thành công",
            data: "edit_item_success"
        })

    } catch (error) {
        //thêm log 
        console.log(error);
        logs.writeErrLog("01eia", JSON.stringify(error))
        return res.status(500).json({
            err: true,
            msg: "Có lỗi trong quá trình thêm dữ liệu - Vui lòng liên hệ quản trị Viên hệ thống để sửa mã lỗi ERRADDWHS",
            data: error
        })
    }
}

//nhập sản phẩm
const importItem = async (req = request, res = response) => {
    //khi nhập sản phẩm thì có 2 dạng 1 là thêm số lượng với những item không có sn và thêm vào kho 1 cái đối với mấy cái có sn
    try {
        // đọc dữ liệu gửi lên
        var { item_uuid, item_price, item_note, item_image, item_amount, item_serial } = req.body;
        //lấy key trong header
        const accessTokenFromHeader = req.headers.x_authorization;
        //Kiểm tra xem người dùng đăng nhập hay chưa
        const isAuth = await Auth.isAuth(accessTokenFromHeader, "add_item");
        if (isAuth.err === true) {
            return res.status(400).json(isAuth)
        }
        const user_uuid = isAuth.data.data[0].user_key
        //kiểm tra có để trống cái nào hay không
        function checkFields(fields) {
            const errorFields = [];
            fields.forEach((field) => {
                if (!req.body[field]) {
                    errorFields.push(field);
                }
            });
        
            if (errorFields.length > 0) {
                return res.status(400).json({
                    err: true,
                    msg: "Vui lòng không để trống dữ liệu",
                    data: errorFields
                });
            }
        }
        const requiredFields = ['item_uuid', 'item_price', 'item_note', 'item_image', 'item_amount', 'item_serial'];
        checkFields(requiredFields);

        //Kiểm tra sản phẩm tồn tại chưa
        const itemGetuuid = itemModel.getItem('item_uuid', item_uuid);
        if (!itemGetuuid.data) {
            return res.status(400).json({
                err: true,
                msg: "Sản phẩm không tồn tại trong cơ sở dữ liệu, vui lòng kiểm tra lại",
                data: "error_null_uuid"
            })
        }
        const thisItem = itemGetuuid.data;

        //kiểm tra xem user nhập là NULLSN hay SN thường
        //Đối với Null SN
        if (item_serial === "NULLSN") {
            //Kiểm tra xem sản phẩm đã có trong kho chuẩn bị nhập chưa
            //nếu chưa thì tiến hành tạo mới 1 cái
            if (condition) {

            }
        }
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    createItem,
    editItem
}