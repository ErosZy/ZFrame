/**
 * POST请求中间件<支持utf-8，例如贴吧还用的GBK，给！我！滚！>
 * fixed:
 * 1.增加上传大小限制，默认2M
 *
 * todo:使用stream.pause对POST数据分段处理，避免内存大量占用
 */

var url = require("url"),
    queryString = require("querystring"),
    util = require("./util.js"),
    _config = require("../config.json"),
    _buf = [],
    _ArrayBuffer,
    _req,
    _position = 0,
    _splite = '',
    _end = '',
    //_type等于0时代表处理bondary或者end-boundary
    //_type等于1时代表处理Content-Disposition与content-type
    //_type等于2时代表处理二进制数据
    _type = 0,
    //用于临时存储
    _tmpArr = [],
    //存放的二进制数据对应的是文件？
    _isBufToFile = false,
    _key = '';

function post(req,res,next){
    var _maxSize = 0,
        _infoSize = 0;

    _req = req;
    _infoSize = _req.infoSize = _req.headers["content-length"];
    _maxSize = util.reSizeDet(_config["upload_max_size"]);

    // 若上传文件数据大小远大于配置文件数据大小
    // 就不处理了，直接进入下一个中间件
    if(_infoSize > _maxSize){
        req.files = [];
        req.body = {};
        next();
        return;
    }

    req.on("data",function(chuck){
        _buf.push(chuck);
    });

    req.on("end",function(){
        var _reg = /boundary=(.*)/,
            _contentType = req.headers["content-type"],
            //能找到content-type则说明附件中包含有文件
            _isFile = _reg.test(_contentType),
            _boundary = RegExp["$1"];

        //分割字符串，例如：------WebKitFormBoundaryMrm3qgDv3veOkMxK
        _splite = "--"+_boundary,
        //结束字符串，例如：------WebKitFormBoundaryMrm3qgDv3veOkMxK--
        _end = "--"+_boundary+"--";

        _ArrayBuffer = Buffer.concat(_buf);
        _buf = null;

        if(_isFile){
            for(_length = _ArrayBuffer.length ; _position < _length ; _position++){
                var _charset = _ArrayBuffer[_position];
                _handler(_charset);
            }
        }else{
            var _parseStr = _ArrayBuffer.toString("utf-8");
            req.body = queryString.parse(_parseStr);
        }

        //重置全局变量
        _resetParams();

        //使用下一个中间件
        next();
    });
}

// 处理函数...嗯...其实应该再细分一下的
function _handler(charset){
    if(!_type){
        _handleBoundary();
    }else if(_type == 1){
        _handleHeader();
    }else{
        _handleBuf();
    }
}

//处理boundary或者end-boundary
function _handleBoundary(){
    _position += _splite.length;

    if(_ArrayBuffer[_position] == 45){
        _position = _ArrayBuffer.length;
    }else{
        _position += 1;
        _type = 1;
    }
}

//处理Content-Disposition与content-type
function _handleHeader(){
    var _start = _position + 1,
        _end = _position + 5;
    _tmpArr.push(_ArrayBuffer[_position]);

    //说明找到是Content-Disposition与content-type的末尾，需要进行正则匹配
    if(_ArrayBuffer.toString("utf-8",_start,_end) === "\r\n\r\n"){
        var _reg = /Content-Disposition: form-data;\s*name="(.+?)"(?:;\s*filename="(.+?)"\s*Content-Type:\s*(.*))?/,
            _buf = new Buffer(_tmpArr),
            _matchStr = _buf.toString("utf-8"),
            _match = _matchStr.match(_reg);

        if(_match){
            if(_match[2]){
                _isBufToFile = true;
                _req.files = !_req.files ? [] : _req.files;

                _req.files.push({
                    name : _match[2],
                    type : _match[3],
                    data : null
                });
            }else{
                _isBufToFile = false;
                _key = _match[1];
                _req.body = !_req.body ? {} : _req.body;

                _req.body[_key] = null;
            }

            _tmpArr = [];
            _position = _end - 1;
            _type = 2;
        }
    }
}

//处理二进制数据
function _handleBuf(){
    var _start = _position + 1,
        _end = _splite.length + _start;

    _tmpArr.push(_ArrayBuffer[_position]);

    if(_ArrayBuffer.toString("utf-8",_start,_end) == _splite){
        if(_isBufToFile){
            var _index = _req.files.length - 1;
            _req.files[_index].data = new Buffer(_tmpArr);
        }else{
            _req.body[_key] = (new Buffer(_tmpArr)).toString("utf-8");
        }

        _isBufToFile = false;
        _type = 0;
    }
}

//将全局变量重置
function _resetParams(){
    _buf = [];
    _position = 0;
    _splite = '';
    _end = '';
    _type = 0;
    _tmpArr = [];
    _isBufToFile = false;
    _key = '';
}

module.exports = post;