/**
 * 工具类
 */

// 判断是否是字符串类型
// 可以迁移到util中
function isString(str){
    var self = this,
        _toString = Object.prototype.toString;

    return _toString.call(str) == "[object String]" ? true : false;
}

// 把cookie字符串转换为json对象
// 可以修改为通用的方法并迁移到util中
function parse(str){
    var arr = str.split(";")
        ,obj = {}

    arr.forEach(function(field){
        var o = field.split("=");
        obj[o[0].trim()] = o[1];
    })

    return obj;
}

//扩充json字符串，类似于jquery中$.extend
function extend(json1,json2){
    var _returnJson = {},
        _key = '';

    for(_key in json2){
        if(json1 && !json1[_key]){
            _returnJson[_key] = json2[_key];
        }else{
            _returnJson[_key] = json1[_key];
        }
    }

    return _returnJson;
}

module.exports = {
    isString : isString,
    parse : parse,
    extend : extend
};