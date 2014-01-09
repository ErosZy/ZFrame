/**
 * Created with JetBrains WebStorm.
 * User: zhaoyang07
 * Date: 13-11-24
 * Time: 下午9:55
 * To change this template use File | Settings | File Templates.
 */
var fs = require("fs");

var ZF = require("../zframe.js"),
    App = new ZF.App(),
    static = ZF.static,
    post = ZF.post,
    view = ZF.view,
    cookie = ZF.cookie,
    session = ZF.session;

App.use(static);

App.use(post);

//App.use(cookie);

App.use(session);

App.post("./index",function(req,res){
    var _path = "./"+req.files[0].name,
        _data = req.files[0].data;

    fs.writeFile(_path,_data,function(err){
        if(err) throw err;
        console.log("success");
    });

    res.writeHead(404,{"Content-Type":"text/html"});
    res.write("error!your age is"+req.body.age);
    res.end();
});

App.get("./index/:id/:name",function(req,res){
    console.log(req.params);
});

App.get("./index02",function(req,res){
    var v = new view(res),
        _id = req.params && req.params.id ? req.params.id : 1;

    v.assign({id:_id,name:"zysuper"});
    v.display("./example/index.tpl");
})

App.get("./index03",function(req,res){
    //res.text("resasdasd");
    //res.redirect("./index02?id=1");
    res.download("C:/Users/zhaoyang07/Downloads/精通正则表达式.pdf");
})

App.get("./favicon.ico",function(req,res){
    res.end();
})

App.listen(8080);
