/**
 * Created by Lance on 2016/10/18.
 */
function getRandom(min, max){
    var r = Math.random() * (max - min);
    var re = Math.round(r + min);
    re = Math.max(Math.min(re, max), min);
    return re;
}

//秒数转换分秒
function formatSeconds(value) {
    var second = parseInt(value);// 秒
    var minute = 0;// 分
    var hour = 0;// 小时
    if(second >= 60) {
        minute = parseInt(second/60);
        second = parseInt(second%60);
        if(minute > 60) {
            hour = parseInt(minute/60);
            minute = parseInt(minute%60);
        }
    }else{
        return '00:'+(second > 9 ? '':'0')+second
    }
    var result = (second > 9 ? "":"0")+parseInt(second)+"";//秒
    if(minute > 0) {
        result = (minute > 9 ? "":"0")+parseInt(minute)+":"+result;//分
    }
    if(hour > 0) {
        result = (hour > 9 ? "":"0")+parseInt(hour)+":"+result;//小时
    }
    return result;
}