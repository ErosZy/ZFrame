/**
 * 文本输出模块
 */


function text(str){
    var self = this;

    self.writeHead(200,{"Content-Type":"text/html"});
    self.write(str);
    self.end();

};

module.exports = text;