var mAudio = document.querySelector('#audio');
mAudio.volume = 0.5;
var mList = [];//音乐
var mCurrentIndex = 0;
var mPlayMode = 'normal';//normal random
var chokidar = require('chokidar');//监控文件夹变化
var dirscanReady = false;
function startWatch(chooesdDir) {
    var watcher = chokidar.watch(chooesdDir, {
        ignored: /[\/\\]\./,
        persistent: true
    });

    watcher.on('ready',function () {
        //console.log('Initial scan complete. Ready for changes');
        dirscanReady = true;
    }).on('all',function (event,path) {
        //console.log(dirscanReady , 'all!');
        //console.log(event , path);
        if(dirscanReady){
            startWork()
        }
    });
}

var fileUtil = require('./js/utils/fileUtil');
var fs = require('fs');
$('#start').click(function () {
    const {dialog} = require('electron').remote;
    dialog.showOpenDialog({
        properties: ['openDirectory']
    },function(path){
        if(path){
            window.localStorage.setItem('music_path',path.toString());
            startListMusic(path.toString())
        }else {
            console.log("No path selected");
        }
    });
});

function startListMusic(choosedDir){
    startWatch(choosedDir);
    $('#current_dir').html(choosedDir);
    fileUtil.getAudios(choosedDir,function (files) {
        //设置第一首歌
        var firstSong = files[0];
        if(firstSong){
            setMusic(firstSong)
        }
        mList = files;//放到全局
        //通知更新歌单
        $.get('http://127.0.0.1:3000/event/refresh_music_list',function (data) {
            console.log(data)
        });
    });
}

function startWork() {
    if(getMusicPath()){
        startListMusic(getMusicPath())
    }
    dirscanReady = false;//重要
}

function setMusic(filename) {
    $('#current_music').html(filename);
    $('#audio').attr('src',getMusicPath() + '/' +filename);
}

function getMusicPath() {
    return window.localStorage.getItem('music_path')
}

//开始工作
// startWork();

//事件====================EVENT===================
mAudio.onended = function() {
    // switch (mPlayMode){
    //     case 'normal':
    //         playMusic('front');
    //         break;
    //     case 'random':
    //         playMusic('random');
    //         break;
    // }
};

mAudio.pause = function() {
    console.log('暂停事件');
    // global.socket.emit('event', {name : 'update_bt' ,d : {
    //     paused : mAudio.paused
    // }});
    // switch (mPlayMode){
    //     case 'normal':
    //         playMusic('front');
    //         break;
    //     case 'random':
    //         playMusic('random');
    //         break;
    // }
};

//开始播放时
mAudio.addEventListener('play',function () {
   //
    console.log('audion play');
    updateCurrentTime()
});

function updateCurrentTime() {
    if(mAudio.paused){
        return;
    }
    var audioSrc = mAudio.src.toString().split('\/');
    var src = decodeURI(audioSrc[audioSrc.length - 1]);
    global.socket.emit('event', {name : 'update_ui' ,d : {
        duration : mAudio.duration
        ,currentTime : mAudio.currentTime
        ,music_progress_value : (mAudio.currentTime * 360)/mAudio.duration
        ,volume : mAudio.volume * 100
        ,paused : mAudio.paused
        ,src : src
        ,play_mode : mPlayMode
    }});
    setTimeout(function () {
        updateCurrentTime()
    },1000);
}







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
});

http.listen(port,function(){
    console.log('正在监听'+port+'端口');
});

//配置api路径
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
router.get('/ctrl/play/:order', function(req, res) {
    console.log(req.params);
    var order = req.params.order;//pause,play,back,next
    //
    switch (order){
        case 'pause':
            if(!mAudio.paused){
                mAudio.pause()
            }
            break;
        case 'play':
            if(mAudio.paused){
                mAudio.play()
            }
            break;
        case 'back':
        case 'next':
            if(mPlayMode == 'normal'){
                if(mCurrentIndex == 0){
                    mCurrentIndex = (mList.length - 1);
                }else{
                    mCurrentIndex = mCurrentIndex + (order == 'back' ? -1 : 1);
                }
            }else if(mPlayMode == 'random'){
                var random = getRandom(0,mList.length - 1);
                while (mCurrentIndex == random){
                    random = getRandom(0,mList.length - 1);
                }
                mCurrentIndex = random;
            }
            break;
    }
    console.log('mCurrentIndex',mCurrentIndex);
    //如果不是暂停播放命令
    if(order != 'pause' && order != 'play'){
        //设置音乐
        setMusic(mList[mCurrentIndex]);
        //播放(不要是暂停命令)
        mAudio.play();
    }
    //
    res.json({
        c : 0
        ,info : 'ctrl send ok!'
    })
});

//设置音乐进度
router.get('/ctrl/audio/currentTime/:second', function(req, res) {
    var second = req.params.second;
    if(second){
        mAudio.currentTime = second;
    }

    global.socket.emit('event', {name : 'setCurrentTime' ,d : second });
    
    res.json({
        c : 0
        ,currentTime : mAudio.currentTime
    })
});
//选取音乐播放
router.get('/ctrl/audio/currentIndex/:index', function(req, res) {
    mCurrentIndex = req.params.index;
    setMusic(mList[mCurrentIndex]);
    mAudio.play();
    global.socket.emit('event', {name : 'check_index' ,d : mCurrentIndex });
    res.json({
        c : 0
    })
});

//通知更新歌单列表
router.get('/event/refresh_music_list', function(req, res) {
    global.socket.emit('event', {name:'refresh_music_list',d:mList});
    res.json({
        c : 0
        ,info : 'update music_list!'
    })
});

//设置循环方式
router.get('/setting/play_mode/:play_mode', function(req, res) {
    var play_mode = req.params.play_mode;
    //normal random
    //通知UI改变
    global.socket.emit('setting', {name:'play_mode',d:play_mode });
    mPlayMode = play_mode;
    res.json({
        c : 0
        ,info : 'play_mode setting ok!'
    })
});

//主动设置音量,0~100
router.get('/setting/volume/:value', function(req, res) {
    var value = req.params.value;
    mAudio.volume = value/100;
    global.socket.emit('setting', {name:'volume',d:value});
    res.json({
        c : 0
        ,info : 'volume set ok!'
    })
});

//主动获取播放列表
router.all('/res/get_music_list', function(req, res) {
    res.json(mList)
});

//获取当前音频的时长和当前时间等属性
router.get('/res/get_audio_prop', function(req, res) {
    // console.log(mAudio);
    var src = decodeURI(mAudio.src.toString().split('\/')[mAudio.src.toString().split('\/').length - 1]);
    res.json({
        c : 0
        ,duration : mAudio.duration
        ,currentTime : mAudio.currentTime
        ,volume : mAudio.volume * 100
        ,readyState : mAudio.readyState  // 0 未连接 1 打开连接 2 发送请求3 交互 4 完成交互，接手响应
        ,paused : mAudio.paused
        ,src : src
        ,play_mode : mPlayMode
    })
});

//本机ip
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('本机ip: '+add);
    var address = 'http://'+add+':3000/remote.html';
    $('#controller_address').html(address);
    $("#qrcode").qrcode({
        render: "canvas", //table方式
        width: 120, //宽度
        height:120, //高度
        text: address //任意内容
    });
});

//开始工作
startWork();