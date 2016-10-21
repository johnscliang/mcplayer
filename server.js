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
io.on("connection", function( socket ){
    console.log( "一个新连接" );
    global.socket = socket;
    // global.socket.emit('test', {order: '111' ,value:'23' });
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

//控制audio
router.get('/c/:order/:value', function(req, res) {
    console.log(req.params);
    var order = req.params.order;
    var value = req.params.value;

    global.socket.emit('mcplayer', {order: order ,value:value });

    res.json({
        c : 0
        ,info : 'send ok!'
    })
});

global.music_list = [];//定义一个全局的数组
//更新歌单列表
router.post('/saveList', function(req, res) {
    global.music_list = JSON.parse(req.body.music_list);

    global.socket.emit('music_list', global.music_list);

    res.json({
        c : 0
        ,info : 'update music_list ok!'
    })

});

//获取
router.all('/getList', function(req, res) {
    res.json(global.music_list)
});

//设置循环方式
router.get('/setting/:play_mode', function(req, res) {
    var play_mode = req.params.play_mode;
    //向展示端进行命令广播
    global.socket.emit('play_mode', {play_mode:play_mode });
    res.json({
        c : 0
        ,info : 'play_mode setting ok!'
    })
});

//设置音量,0~100
router.get('/volume/:value', function(req, res) {
    var value = req.params.value;

    global.socket.emit('volume', {value:value});

    res.json({
        c : 0
        ,info : 'volume set ok!'
    })
});

//获取当前音频的时长和当前时间等属性
router.get('/audio/prop', function(req, res) {
    console.log(mAudio);
    var src = decodeURI(mAudio.src.toString().split('\/')[mAudio.src.toString().split('\/').length - 1]);
    res.json({
        c : 0
        ,duration : mAudio.duration
        ,currentTime : mAudio.currentTime
        ,volume : mAudio.volume * 100
        ,readyState : mAudio.readyState
        ,paused : mAudio.paused
        ,src : src
    })
});

//设置音乐进度
router.get('/audio/setCurrentTime/:second', function(req, res) {
    var second = req.params.second;
    if(second){
        mAudio.currentTime = second;
    }

    global.socket.emit('setCurrentTime', {second:second});

    res.json({
        c : 0
        ,currentTime : mAudio.currentTime
    })
});

//本机ip
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('本机ip: '+add);
    $("#qrcode").qrcode({
        render: "table", //table方式
        width: 100, //宽度
        height:100, //高度
        text: 'http://'+add+':3000/ctrl.html' //任意内容
    });
});

