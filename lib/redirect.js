/**
 * 跳转模块
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