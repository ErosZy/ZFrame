/*
 * cookie中间件
 * 目前存在的bug，domain在localhost的时候设置无效
 */

var util = require("./util"),
    _option = {
    value : "",
    expires : 0,
    path : "/"
};

function cookie(req,res,next){
    var self = this;

    //json:{value:"sessionId=1",expires:1,path:"./",domain:"http://www.baidu.com"}
    res.cookie = function(data){
        //若是字符串则是获取cookie值，
        //否则视为设置值cookie值
        if(util.isString(data)){
            return req.headers && req.headers.cookie ? util.parse(req.headers.cookie)[data] : '';
        }else{
            var _info = util.extend(data,_option),
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

module.exports = cookie;