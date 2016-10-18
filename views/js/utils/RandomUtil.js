/**
 * Created by Lance on 2016/10/18.
 */
function getRandom(min, max){
    var r = Math.random() * (max - min);
    var re = Math.round(r + min);
    re = Math.max(Math.min(re, max), min);
    return re;
}