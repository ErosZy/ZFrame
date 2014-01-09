/**
 * 文件下载模块
 */

var fs = require("fs"),
    path = require("path");

function download(filePath){
    var self = this;

    fs.readFile(filePath,function(err,data){
        if(err){
            self.statusCode = 404;
            self.end();
        }else{
            var _size = data.length;

            self.writeHead(200,{"Content-Type":"application/octet-stream",
                                "Accept-Length":_size,
                                "Content-Disposition":"attachment;filename=" + path.basename(filePath)
                                });
            self.write(data);
            self.end();
        }
    });
}

module.exports = download;