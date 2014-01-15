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
function parse(str){
    var self = this,
        arr = str.split(";"),
        obj = {};

    arr.forEach(function(field){
        var o = field.split("=");
        obj[o[0].trim()] = o[1];
    })

    return obj;
}

//扩充json字符串
//json1 : {name:"zysuper"}
//json2 : {name:"zx",age:100}
//-------->{name:"zysuper",age:100}
function extend(json1,json2){
    var self = this,
        _returnJson = {},
        _key = "";

    for(_key in json1){
        if(json1.hasOwnProperty(_key)){
            _returnJson[_key] = json1[_key];
        }
    }

    for(_key in json2){
        if(!json1.hasOwnProperty(_key)){
            _returnJson[_key] = json2[_key];
        }
    }

    return _returnJson;
}

//去除字符串左右两边的空格
function trim(str){
    return str.replace(/(^\s*)|(\s*$)/g,"");
}

//转换字符串为对应的计量数据
function sizeDet(size){
    var self = this;

    if(size<1024*1024){
        return Math.floor((size/1024)) + 'KB';
    }else if(size < (1024*1024*1024)){
        return Math.floor((size/(1024*1024))) + 'M';
    }else if(size < (1024*1024*1024*1024)){
        return Math.floor((size / (1024*1024*1024))) + 'GB';
    }else{
        return Math.floor((size / (1024*1024*1024*1024))) + 'T';
    }

    return false;
}

//转化计量数据为字符串
function reSizeDet(size){
    var self = this, 
        _match = size.match(/\D+/),
        _tmp = 0;

    switch(_match[0].toUpperCase()){
        case 'K':
        case 'KB':
            _tmp=1024;
            break;
        case 'M':
        case 'MB':
            _tmp=1024*1024;
            break;
        case 'G':
        case 'GB':
            _tmp=1024*1024*1024;
            break;
        case 'T':
        case 'TB':
            _tmp=1024*1024*1024*1024;
            break;
    }

    return Number(size.slice(0,_match.index)) * _tmp;
}

module.exports = {
    isString : isString,
    parse : parse,
    extend : extend,
    trim : trim,
    sizeDet : sizeDet,
    reSizeDet : reSizeDet
};