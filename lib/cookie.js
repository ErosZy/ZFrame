/*
 * cookie中间件
 * 目前存在的bug，domain在localhost的时候设置无效
 */

var util = require("./util"),
    _option = {
        expires : 0,
        path : "/",
        domain : "",
        secure : false,
        httpOnly : false
    };

function cookie(req,res,next){
    var self = this;

    req.cookie = function(data){

        //若是字符串则是获取cookie值，
        //否则视为设置值cookie值
        if (!util.isString(data)) {
            var _info = util.extend(data, _option),
                _now = +new Date(),
                _expires = _now + _info.expires * 1000,
                _value = "",
                _key = "";

            //0是设置session
            _info.expires = _info.expires ? new Date(_expires).toUTCString() : 0;

            //domain在本地localhost的时候不能设置...具体原因不太清楚...
            if (data.domain) {
                _info.domain = data.domain;
            }else{
                delete  _info.domain;
            }

            for (_key in _info) {
                if(_key == "secure" || _key == "httpOnly"){
                    if(_info[_key]){
                        _value += _key + "; ";
                    }
                }else{
                    _value += _key + "=" + _info[_key] + "; ";
                }
            }

            //这里是为了保证session能被设置而加入的变量
            //这个变量不应该被访问
            //需要访问cookie值req.cookie()方法
            req._cookies = _value;

            //这里主要是为了保证session能被设置上
            if(req.sessionId){
                _value = ["JSESSION="+req.sessionId +"; expires=0; path=/;" , _value];
            }

            res.setHeader("Set-Cookie", _value);

        } else {
            return req.headers && req.headers.cookie ? util.parse(req.headers.cookie)[data] : '';
        }
    }

    next();
}

module.exports = cookie;