/**
 * 跳转模块
 *
 * added：添加相对路径的支持
 */


function redirect (req,res,next){

    res.redirect = function(location){
        var self = this,
            _reg = /^https?:\/\/(.+?\/?)+$/gi;

        if(!_reg.test(location)){
            location = "http://" + req.headers.host + "/" + location;
        }

        self.writeHead(302,{"Location":location});
        self.end();
    }
    next();
}

module.exports = redirect;