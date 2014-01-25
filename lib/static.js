/**
 * 静态文件中间件
 */

var fs = require("fs"),
    url = require("url"),
    _config = require("../config.json");

function static(req,res,next){
    var self = this,
        filePath = _config["public_path"] + "/" + url2Path(req.url);

    fs.readFile(filePath,function(err,data){
        if(err){
            next();
        }else{
            res.writeHead(200,{"Content-Type":"text/html"});
            res.write(data);
            res.end();
        }
    });
}

function url2Path(path){
    return url.parse(path).path;
}

module.exports = static;