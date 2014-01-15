/*
 *  session中间件
 *  session不具有读的方法，因为session本质就是cookie(expires:0)
 *  session默认的名称为JSESSION
 *  值得注意的是，无法保证session不被伪造，因此需要依靠其他的方式来阻止这种行为
 */

var util = require("./util"),
    crypto = require("crypto"),
    sid = +new Date(),
    cache = {};

function session(req,res,next){
    var _cookies = req.headers.cookie,
        _sessionId = "";

    req.session = function(){
        var self = this;

        //1.无session的时候需要设置
        if(!req.sessionId){
            _setSession(self,res);
        }

        //存在cookie，但是没有session时也需要设置
        if(_cookies && !(_sessionId = util.parse(_cookies).JSESSION)){
            _setSession(self,res);
        }
    }

    //每次访问的时候检查sessionId
    //若客户端有修改session以此来冒充
    //则req.sessionId == undefined
    if(_cookies && (_sessionId = util.parse(_cookies ).JSESSION)){
        req.sessionId = cache[_sessionId];
    }

    next();

}

//设置session函数
function _setSession(req,res){
    var _md5 = crypto.createHash('md5'),
        _value = '';

    _md5.update(""+(sid++));
    _md5 = _md5.digest("hex");

    cache[_md5] = _md5;
    req.sessionId = _md5;

    //此处是保证cookie能被设置到
    if(req._cookies){
        _value = ["JSESSION="+_md5+"; expires=0; path=/;",req._cookies];
    }else{
        _value = ["JSESSION="+_md5+"; expires=0; path=/;"];
    }

    res.setHeader("Set-Cookie",_value);
}

module.exports = session;