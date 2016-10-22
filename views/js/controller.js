/**
 * Created by admin on 2016/10/20.
 */
var mAudioInfo;
var mMusicList;
var mMusicStep;

function init(callback) {
    $.get('/audio/prop',function (audioInfo,st) {
        if(st == 'success'){
            $.get('/getList',function (musicList,st) {
                if(st == 'success'){
                    mAudioInfo = audioInfo;
                    mMusicList = musicList;
                    //
                    mAudioInfo.duration = parseInt(audioInfo.duration);
                    mAudioInfo.currentTime = parseInt(audioInfo.currentTime);
                    callback(true)
                }else{
                    callback(false)
                }
            });
        }else{
            callback(false)
        }
    });
}

//自动更新滑动条的函数
function updateMusicProgress() {
    if(mAudioInfo.paused){
        return;
    }
    setTimeout(function () {
        var currentValue = $("#music_progress").roundSlider('getValue');
        var newValue = currentValue + mMusicStep;
        if(currentValue < newValue){
            $("#music_progress").roundSlider('setValue',newValue);
        }
        //
        if(mAudioInfo.duration > mAudioInfo.currentTime){
            mAudioInfo.currentTime++;
            $('#current_time').html(formatSeconds(mAudioInfo.currentTime));
        }
        updateMusicProgress()
    },1000);
}

function refreshUI() {
    init(function (ok) {
        if(ok){
            //设置音乐信息
            $('input[type="range"]').val(mAudioInfo.volume).change();//音量
            $('#voice').html(mAudioInfo.volume);
            $('#play_mode').html(mAudioInfo.play_mode == 'normal' ? '顺序播放':'随机播放');
            $('#play_or_pause').html(mAudioInfo.paused ? '播放':'暂停');
            $('#current_music_name').html(mAudioInfo.src);
            $('#total_time').html(formatSeconds(mAudioInfo.duration));
            $('#current_time').html(formatSeconds(mAudioInfo.currentTime));
            var musicValue = (360 * mAudioInfo.currentTime)/(mAudioInfo.duration);
            $("#music_progress").roundSlider('setValue',musicValue);
            mMusicStep = mAudioInfo.duration / 360;
            updateMusicProgress();
        }else{
            //客户端方法，本地端注释
            // $('#error_tips').show();
        }
    })
}

$(function () {
    refreshUI()
});
//手动音量控制
$('#range_volume').rangeslider({
    polyfill:false
    ,onSlideEnd: function(position, value) {
        //设置音量
        $.get('/setting/volume/'+value,function (data,st) {
            //$('#voice').html(value);
        })
    }
});
//手动音乐进程控制:
//文档：http://roundsliderui.com/document.html
$("#music_progress").roundSlider({
    radius: 70
    ,width: 8
    ,handleSize: "+16"
    ,handleShape: "dot"
    ,sliderType: "min-range"
    ,min : 0
    ,max : 360
    ,showTooltip : false
});
$("#music_progress").on("change", function (e) {
    // console.log(e.value);
    // console.log($("#music_progress").roundSlider('getValue'));
    //换算成秒数，
    var musicValue = parseInt((e.value * mAudioInfo.duration) / 360);
    //设置远程，成功之后继续
    $.get('/ctrl/audio/currentTime/'+musicValue,function (data,st) {
        //mAudioInfo.currentTime = parseInt(musicValue);
        //$('#current_time').html(formatSeconds(mAudioInfo.currentTime));
    })
});
//交互：切换菜单
$('#go2list').click(function () {
    $('#music_list').fadeIn();
});
$('#back2main').click(function () {
    $('#music_list').fadeOut();
});
//下一首
$('#play_next').click(function () {
    $.get('/ctrl/play/next',function (data,st) {
        refreshUI()
    })
});
//上一首
$('#play_back').click(function () {
    $.get('/ctrl/play/back',function (data,st) {
        refreshUI()
    })
});
//播放/暂停
$('#play_or_pause').click(function () {
    var order;
    if($(this).html() == '暂停'){
        order = 'play'
    }else{
        order = 'pause'
    }
    $.get('/ctrl/play/'+order,function (data,st) {
        refreshUI()
    })
});
//切换模式
$('#check_mode').click(function () {
    var play_mode;
    if($('#play_mode').html() == '随机播放'){
        play_mode = 'normal'
    }else {
        play_mode = 'random'
    }
    $.get('/setting/play_mode/'+play_mode,function (data,st) {
        refreshUI()
    })
});


//和服务端通信，被动控制
var socket = io.connect('/');
//事件
socket.on('event', function (data){
    console.log('event');
    console.log(data);
    refreshUI();
    // switch (data.name){
    //     case 'play'://播放事件，上一首，下一首，暂停/播放
    //     case 'check_index'://选取一首
    //     case 'setCurrentTime'://音乐进度改变
    //     case 'refresh_music_list'://刷新歌单
    // }
});

socket.on('setting', function (data){
    console.log('setting');
    console.log(data);
    refreshUI();
    // switch (data.name){
    //     case 'play_mode':
    //         //播放模式设置
    //         $('#play_mode').html(data.d == 'normal' ? '顺序播放':'随机播放');
    //         break;
    //     case 'volume':
    //         //音量设置
    //         //重新获取音乐信息
    //         break;
    // }
});