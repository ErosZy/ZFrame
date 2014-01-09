/*
 *  session中间件
 *
 */

var crypto = require("crypto"),
    sid = Date.now(),
    cache = {}

function session(req,res,next){

    Object.defineProperty(res,"session",{
        get: function(){
            return cache[this.sessionId];
        },
        set: function(value){
            cache[this.sessionId] = value;
        }
    })

    if(!(req.headers.cookie && (req.sessionId = parse(req.headers.cookie).sessionId))){
        var _md5 = crypto.createHash('md5');
        _md5.update(""+(sid++));
        res.sessionId = _md5.digest("hex");

        res.setHeader("Set-Cookie",["sessionId="+res.sessionId])
    }

    next();

}

//把cookie字符串转换为json对象
function parse(str){
    var arr = str.split(";")
        ,obj = {}

    arr.forEach(function(field){
        var o = field.split("=");
        obj[o[0].trim()] = o[1];
    })

    return obj;
}

module.exports = session;