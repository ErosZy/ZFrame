var index = 1;

App.get("./index",function(req,res){
    console.log("this is index");
    console.log(req.url);
    res.end();
});

App.get("./index/:id/:name",function(req,res){
    res.writeHeader(200,{"Content-Type":"text/html"})
    res.write(JSON.stringify({name:"zysuper",error:null,errno:-1}));
    res.end();
});

App.get("./index02/:id/:name",function(req,res){
    var v = new View(res,true,5),
        _id = req.params && req.params.id ? req.params.id : 1;

    v.assign({id:_id,name:"zysuper"});
    v.display("./template/index.tpl");
})