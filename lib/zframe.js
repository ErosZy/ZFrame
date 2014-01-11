/*加载lib中的核心类文件*/

var fs = require("fs"),
    _config = require("../config.json"),
    _files = [];

_files = fs.readdirSync(_config.libPath);

if(!_files.length) throw new Error("zFrame can't complete init");

for(var i = 0,_length = _files.length ; i< _length ; i++){
    var _key = _files[i].slice(0,-3),
        _path = _config.zframePath + _files[i]

    exports[_key] = require(_path);
}