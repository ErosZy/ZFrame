/**
 * 文本输出模块
 */


function text(req,res,next){

    res.text = function(str){
        var self = this;
        
        self.writeHead(200,{"Content-Type":"text/html"});
        self.write(str);
        self.end();
    }
    next();
};

module.exports = text;