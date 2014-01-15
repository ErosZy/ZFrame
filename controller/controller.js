var index = 1;

App.get("./index",function(req,res){
    console.log(req.xss(req.params));
});

App.get("./index/:id/:name",function(req,res){
    req.session();
    res.writeHeader(200,{"Content-Type":"text/html"})
    res.write(JSON.stringify({name:"zysuper",error:null,errno:-1}));
    res.end();
});

App.get("./index02/:id/:name",function(req,res){
    req.cookie({user:"zysuper",expires:60*60,path:"/"});
    req.session();
    var v = new View(res,true,5),
        _id = req.params && req.params.id ? req.params.id : 1;

    v.assign({id:_id,name:"zysuper"});
    v.display("./template/index.tpl");
})

App.get("./index00/:id",function(req,res){
    if(!req.sessionId){
       res.redirect("./index02/100/zysuper");
    }

    var v = new View(res,false),
        _id = req.params && req.params.id ? req.params.id : 1;

    v.assign({id:_id,name:"zysuper"});
    v.display("./template/index2.tpl");
})