/**
 * Created with JetBrains WebStorm.
 * User: zhaoyang07
 * Date: 14-1-11
 * Time: 下午9:23
 * To change this template use File | Settings | File Templates.
 */
var index = 2;

App.post("./index10",function(req,res){
    console.log(req.body);
    res.statusCode = 200;
    res.end();
})