/**
 * Created by Lance on 2016/10/15.
 */
var fs = require('fs');
var mime = require('mime-types');
var path = require('path');

module.exports = {

    getAudios : function (dir, callback) {

        fs.readdir(dir,function(err, files){
            var reDate = [];
            files.forEach(function (file) {
                var mimetype = mime.contentType(path.extname(dir+'/'+file));
                if(mimetype.toString().indexOf('audio') >= 0){
                    reDate.push(file)
                }
            });
            if (err) {
                return console.error(err);
            }
            callback(reDate);
        });

    }
    
};