require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))


app.use('/server', (request, response) => {
    response.json({err: false, msg:"Máy chủ ok"});
});

//Chức năng xác thực người dùng
const authRouter = require('./routes/auth/auth.route')
app.use('/auth', authRouter)
//định tuyến của người dùng (sửa thông tin, đổi pass, lấy thông tin,..)
const userRouter = require('./routes/user/user.router')
app.use('/user', userRouter)
//định tuyến của kho
const whCatRouter = require('../warehouse/routes/catalog.routes');
app.use('/wh/cat', whCatRouter)

const whWhsRouter = require('../warehouse/routes/warehouse.routes');
app.use('/wh/whs', whWhsRouter)

const whCusRouter = require('../warehouse/routes/customer.routes');
app.use('/wh/cus', whCusRouter)

const whItemRouter = require('../warehouse/routes/item.routes');
app.use('/wh/item', whItemRouter)

const whManRouter = require('../warehouse/routes/manufactor.routes');
app.use('/wh/man', whManRouter)


//Quăng ra thông báo khi truy cập link không tồn tại 404
app.use(function(request, response, next) {
    response.status(404).json({err: true, msg:"Lỗi 404"});
});

//Khai báo cho đống code chạy cổng nào
const port = process.env.port || 3001
//khởi động server
const server = app.listen(port, console.log(`Ứng dụng lắng nghe tại cổng ${port}`))

module.exports = {app, server}