/**
 * Created by admin on 2016/10/20.
 */
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
