/**
 * socket.io
 */
var express = require('express');
var request = require('request');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var router = express.Router();
var port = process.env.PORT || 3000;
//配置网页文件目录
app.set('views','./html');
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'')));//就是当前路径

//socket连接
io.on( "connection", function( socket ){
    console.log( "一个新连接" );
});

http.listen(port,function(){
    console.log('正在监听'+port+'端口');
});

//配置api路径
//get请求示例:http://172.0.0.1:3000/c/page1
app.use('/', router);

//跨域处理
router.all(/\/*/, function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");// 跨域访问
    next();
});

router.get('/', function(req, res, next) {
    res.send('服务已启动');
});

router.get('/c/:token/:order/:value', function(req, res) {

    console.log(req.params);
    var token = req.params.token;
    var order = req.params.order;
    var value = req.params.value;
    //向展示端进行命令广播
    io.sockets.emit(token, {order: order ,value:value });

    res.json({
        c : 0
        ,info : 'send ok!'
    })
});