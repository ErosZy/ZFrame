/*
 * cookie中间件
 * 目前存在的bug，domain在localhost的时候设置无效
 */

var _option = {
    value : "",
    expires : 0,
    path : "/"
}

function cookie(req,res,next){
    var self = this;

    //json:{value:"sessionId=1",expires:1,path:"./",domain:"http://www.baidu.com"}
    res.cookie = function(data){
        //若是字符串则是获取cookie值，
        //否则视为设置值cookie值
        if(_isString(data)){
            return req.headers && req.headers.cookie ? parse(req.headers.cookie)[data] : '';
        }else{
            var _info = extend(data,_option),
                _now = +new Date(),
                _expires = _now + _info.expires * 1000,
                _value = "",
                _key = "";

            _info.expires = new Date(_expires).toUTCString();

            //domain在本地localhost的时候不能设置...具体原因不太清楚...
            if(data.domain){
                _info.domain = data.domain;
            }

            for(_key in _info){
                if(_key == "value"){
                    _value += _info[_key] + "; ";
                }else{
                    _value += _key + "=" + _info[_key] + "; ";
                }
            }

            res.setHeader("Set-Cookie",_value.slice(0,_value.length - 2));
        }

    }

    //此处主要是供session使用
    if(next){
        next();
    }
}

// 判断是否是字符串类型
// 可以迁移到util中
function _isString(str){
    var self = this,
        _toString = Object.prototype.toString;

    return _toString.call(str) == "[object String]" ? true : false;
}

// 把cookie字符串转换为json对象
// 可以修改为通用的方法并迁移到util中
function parse(str){
    var arr = str.split(";")
        ,obj = {}

    arr.forEach(function(field){
        var o = field.split("=");
        obj[o[0].trim()] = o[1];
    })

    return obj;
}

//扩充json字符串，类似于jquery中$.extend
function extend(json1,json2){
    var _returnJson = {},
        _key = '';

    for(_key in json2){
        if(json1 && !json1[_key]){
            _returnJson[_key] = json2[_key];
        }else{
            _returnJson[_key] = json1[_key];
        }
    }

    return _returnJson;
}

module.exports = cookie;