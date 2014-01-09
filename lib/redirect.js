/**
 * 跳转模块
 */


function redirect (location){
    var self = this;

    self.writeHead(302,{"Location":location});
    self.end();
}

module.exports = redirect;