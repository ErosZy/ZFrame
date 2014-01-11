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
    res.writeHeader(200,{"Content-Type":"text/html"})
    res.write(JSON.stringify({name:"zysuper",error:null,errno:-1}));
    res.end();
});

App.get("./index02",function(req,res){
    console.log(1);
    var v = new View(res,true,5),
        _id = req.params && req.params.id ? req.params.id : 1;

    v.assign({id:_id,name:"zysuper"});
    v.display("./template/index.tpl");
})