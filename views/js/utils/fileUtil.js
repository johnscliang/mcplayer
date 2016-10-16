/**
 * Created by Lance on 2016/10/15.
 */
var fs = require('fs');

module.exports = {

    readdir : function (dir, callback) {

        fs.readdir(dir,function(err, files){
            if (err) {
                return console.error(err);
            }
            callback(files);
        });

    }
    
};