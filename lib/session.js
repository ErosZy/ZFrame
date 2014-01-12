/*
 *  session中间件
 *
 */

var util = require("./util"),
    crypto = require("crypto"),
    sid = +new Date(),
    cache = {}

function session(req,res,next){

    if(!res.cookie) var _cookie = require("./cookie.js");

    Object.defineProperty(res,"session",{
        get: function(){
            return cache[this.sessionId];
        },
        set: function(value){
            cache[this.sessionId] = value;
        }
    })

    if(!(req.headers.cookie && (req.sessionId = util.parse(req.headers.cookie).sessionId))){
        var _md5 = crypto.createHash('md5');

        _md5.update(""+(sid++));
        res.sessionId = _md5.digest("hex");
        res.setHeader("Set-Cookie",["sessionId="+res.sessionId])
    }
    next();

}

module.exports = session;