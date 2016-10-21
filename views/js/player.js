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

$(function () {
    init(function (ok) {
        if(ok){
            //设置音乐信息
            $('#current_music_name').html(mAudioInfo.src);
            $('#total_time').html(formatSeconds(mAudioInfo.duration));
            $('#current_time').html(formatSeconds(mAudioInfo.currentTime));
            var musicValue = (360 * mAudioInfo.currentTime)/(mAudioInfo.duration);
            $("#music_progress").roundSlider('setValue',musicValue);
            mMusicStep = mAudioInfo.duration / 360;
            updateMusicProgress();










        }else{
            $('#error_tips').show();
        }
    })
});




















$('#range_volume').rangeslider({
    polyfill:false
    ,onSlideEnd: function(position, value) {
        $('#voice').html(value)
    }
});

//音乐进程:
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
    console.log(e.value);
    console.log($("#music_progress").roundSlider('getValue'))
});


//切换菜单
$('#go2list').click(function () {
    $('#music_list').fadeIn();
});
$('#back2main').click(function () {
    $('#music_list').fadeOut();
});






//服务端
