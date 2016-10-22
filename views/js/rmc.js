/**
 * Created by admin on 2016/10/20.
 */
var mAudioInfo;
var mMusicList;


//手动音量控制
var mMusicVolumeDragging = false;
$('#range_volume').rangeslider({
    polyfill:false
    ,onSlide: function(position, value) {
        mMusicVolumeDragging = true;
    }
    ,onSlideEnd: function(position, value) {
        mMusicVolumeDragging = false;
        //设置音量
        $.get('/setting/volume/'+value,function (data,st) {
            
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
    //设置远程，成功之后继续
    $.get('/ctrl/audio/currentTime/'+e.value,function (data,st) {
        //mAudioInfo.currentTime = parseInt(musicValue);
        //$('#current_time').html(formatSeconds(mAudioInfo.currentTime));
    })
});
var mMusicProgressDragging = false;
$("#music_progress").on("drag", function (e) {
    mMusicProgressDragging = true;
});
$("#music_progress").on("stop", function (e) {
    mMusicProgressDragging = false;
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
    var order = mAudioInfo.play_mode == 'normal' ? 'next':'random';
    $.get('/ctrl/play/'+order,function (data,st) {

    })
});
//上一首
$('#play_back').click(function () {
    var order = mAudioInfo.play_mode == 'normal' ? 'back':'random';
    $.get('/ctrl/play/'+order,function (data,st) {

    })
});
//播放/暂停
$('#play_or_pause').click(function () {
    var order;
    if($(this).html() == '暂停'){
        order = 'pause';
    }else{
        order = 'play';
    }
    $.get('/ctrl/play/'+order,function (data,st) {

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

    })
});


//和服务端通信，被动控制
var socket = io.connect('/');
//事件
socket.on('event', function (data){
    // console.log('event',data.name,data.order);
    //console.log(data);
    switch (data.name){
        case 'play'://播放事件，上一首，下一首，暂停/播放
        case 'check_index'://选取一首
        case 'setCurrentTime'://音乐进度改变
        case 'refresh_music_list'://刷新歌单
            //TODO 请求新歌单
            break;
        case 'update_ui':
            // console.log('远程端收到更新');
            $('#total_time').html(formatSeconds(data.d.duration));
            $('#current_time').html(formatSeconds(data.d.currentTime));
            if(!mMusicProgressDragging){//如果没有被拉着
                $("#music_progress").roundSlider('setValue',data.d.music_progress_value);
            }
            $('#voice').html(data.d.volume);
            if(!mMusicVolumeDragging){
                $('input[type="range"]').val(data.d.volume).change();//音量
            }
            $('#play_mode').html(data.d.play_mode == 'normal' ? '顺序播放':'随机播放');
            $('#play_or_pause').html(data.d.paused ? '播放':'暂停');
            $('#current_music_name').html(data.d.src);
            //
            mAudioInfo = data.d;
            break;
        case 'update_bt'://暂停事件
            console.log(data.d.paused);
            $('#play_or_pause').html(data.d.paused ? '播放':'暂停');
            break;
    }
});

socket.on('setting', function (data){
    console.log('setting');
    console.log(data);
    switch (data.name){
        case 'play_mode':
            //播放模式设置
            $('#play_mode').html(data.d == 'normal' ? '顺序播放':'随机播放');
            break;
        case 'volume':
            //音量设置
            $('#voice').html(data.d);
            $('input[type="range"]').val(data.d).change();//音量
            //重新获取音乐信息
            break;
    }
});






//vue
