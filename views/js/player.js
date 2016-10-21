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


//音乐进程
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
});
