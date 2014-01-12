/*
* XSS中间件
* 过滤post以及get的XSS
*
* */
var filter = require("xss"),
    util = require("./util");

function xss(req,res,next){

    req.xss = function(data){
        if(util.isString(data)){
            return filter(data);
        }else{
            var _key = '',
                _value = '',
                _params = {};

            for(_key in data){
                _params[_key] = filter(data[_key]);
            }

            return _params;
        }
    };

    next();
}

module.exports = xss;