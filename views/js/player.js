/**
 * Created by admin on 2016/10/20.
 */
$('input[type="range"]').rangeslider({
    polyfill: false,

    // Callback function
    onInit: function() {},

    // Callback function
    onSlide: function(position, value) {
        // console.log(position,value)
    },

    // Callback function
    onSlideEnd: function(position, value) {
        console.log(position,value)
    }
});