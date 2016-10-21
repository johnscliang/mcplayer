/**
 * Created by admin on 2016/10/20.
 */
//音量
$('#range_time').rangeslider({
    polyfill:false
    ,onSlideEnd: function(position, value) {
        console.log(position,value)
    }
});

$('#range_volume').rangeslider({
    polyfill:false
    ,onSlideEnd: function(position, value) {
        console.log(position,value)
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
    ,max : 200
    ,showTooltip : false
});

$("#music_progress").on("change", function (e) {
    console.log(e.value);
    console.log($("#music_progress").roundSlider('getValue'))
});


//用$.fadeIn()之类来切换菜单
$('#go2list').click(function () {
   $('#music_list').fadeIn();
});
$('#back2main').click(function () {
    $('#music_list').fadeOut();
});








//服务端
