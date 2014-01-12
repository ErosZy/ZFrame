/**
 * 跳转模块
 */


function redirect (req,res,next){

    res.redirect = function(location){
        var self = this;
        self.writeHead(302,{"Location":location});
        self.end();
    }
    next();
}

module.exports = redirect;