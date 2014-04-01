/**
 * 简单的模板及静态化引擎
 * 模板引擎的原理很简单，
 * 对规定的边界进行正则匹配，然后new Function()
 * 此模板引擎规定默认边界为<%...%>
 * 比如:
 * <% if (id == 100) { %>
 *  hello <% name %> !
 * <% } %>
 *
 */

var fs = require("fs"),
    _config = require("../config.json"),
    _existsTpl = false;

//构造函数
//这里本来想使用单例，但是存在问题是
//单例在高并发的时候会产生冲突
function View(res){
    var self = this;

    if(self == global){
        return new View(res);
    }else{
        self._res = res;

        //第一次初始化的时候检测一下
        if(!_existsTpl){
            var _flag = fs.existsSync(_config["template_path"]);

            if(!_flag){
                fs.mkdirSync(_config["template_path"]);
            }

            _existsTpl = true;
        }
    }
}

// 模板赋值
View.prototype.assign = function(data){
    var self = this;
    self._data = data;
}

// 显示模板,此函数涉及到的功能太多...需要精简一下
View.prototype.display = function(filePath){
    var self = this,
        _path = self._path;

    _path = filePath ? filePath : _path;
    self._path = _path;

    //如果不存在path就直接抛异常
    if(!_path){
        throw new Error("lost {path} param");
    }else{
        fs.exists(_path,function(exists){
            if(exists){
                self._readTpl(_path);
            }else{
                throw new Error("Can't find："+_path);
            }
        })
    }
}

//读取模板并解析，返回数据
View.prototype._readTpl = function(_filePath){
    var self = this;

    fs.readFile(_filePath,function(err,data){

        //缺少log.js
        if(err) throw err;

        self._str = data.toString("utf-8");

        self._replaceNotes()
            ._matchTplStr();

        self._res.writeHead(200,{"Content-Type":"text/html"});
        self._res.write(self._str);
        self._res.end();
    });
}

//清除模板中的单行注释、制表符、回车和多行注释
//请注意清除的顺序，必须是需要单行注释先清除的
View.prototype._replaceNotes = function(){
    var self = this,
        _str = self._str;

                //第一步，清空单行注释
    self._str = _str.replace(/\/\/.*/g,'')
                //第二步，清除制表符、回车
               .replace(/\s+/g,'')
                //第三步，清楚多行注释
               .replace(/\/\*.*\*\//,'')
                //第四部，转义单引号
               .replace(/'/,"\\'");

    return self;
}

//匹配模板字符串
//利用new Function返回运行后的字符串
View.prototype._matchTplStr = function(){
    var self = this,
        _str = self._str,
        _regStr = _config["lefter"]+"\\\s*(.*?)\\\s*"+_config["righter"],
        _reg = new RegExp(_regStr,"g"),
        _match = [],
        _position = 0,
        _strArr = ["var str = '';"];

    while(_match = _reg.exec(_str)){

        _strArr.push("str +='"+_str.slice(_position,_match.index)+"';");

        if(/[{}><=]|var|\s+/.test(_match[1])){
            _strArr.push(_match[1]);
        }else{
            _strArr.push("str += ("+_match[1]+");");
        }

        _position = _match.index + _match[0].length;
    }

    _strArr.push("str += '"+_str.slice(_position,_str.length)+"';");
    _strArr.push("return str;");

    _str = _strArr.join('');

    self._str = (new Function("data",_str))(self._data);

    return self;
}

module.exports = View;




