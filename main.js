/**
 * 主控制器，用来load其他的controller
 * 这样就可以保证其他的controller是指写路由代码的
 */

var fs = require("fs"),
    ZF = require("./lib/zframe.js"),
    App = new ZF.App(),
    View = ZF.view,
    _config = require("./config.json"),
    _files = [],
    _fileCount = 0,
    _timer = 0,
    _tmpStr = '';

//使用中间件
for(var i = 0,_length = _config.middle; i < _length ; i++){
    App.use(ZF[_config.middle[i]]);
}

//扫描controller文件夹，将里面的controller全部读取
fs.readdir("./controller",function(err,_files){
    _fileCount = _files.length;

    for(var i = 0; i < _fileCount ;i++){
        fs.readFile("./controller/"+_files[i],function(err,data){
            if(err) throw new Error("Can't Read Controller Files");

            _tmpStr += data.toString();

            if(_timer++ != _fileCount - 1) return;

            (new Function("App,View",_tmpStr))(App,View);
        })
    }
});

//监听端口
App.listen(_config.serverPort);