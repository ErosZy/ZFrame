/**
 * 简单的模板及静态化引擎
 * 模板引擎的原理很简单，
 * 对规定的边界进行正则匹配，然后new Function()
 * 此模板引擎规定默认边界为<@...@>
 * 比如:
 * <@ if (id == 100) { @>
 *  hello <@ name @> !
 * <@ } @>
 *
 * fixed:
 *      1.修复写文件在高并发下的异常
 *        (实现原理是通过写文件锁实现)
 *      2.修复模板中含有单引号无法解析的bug
 *
 */

var fs = require("fs"),
    path = require("path"),
    _config = require("../config.json"),
    _files = {},
    _parseInfo = {},
    //写文件锁，使用变量和setImmediate实现
    //写文件是优先的，在写文件过程中使用setImmediate延迟读操作
    //但是在非常非常高的兵法下，读文件会有异常...
    //这个应该是node自身的问题，没办法规避
    //添加写文件锁后测试结果为：ab -n 50000 -c 20000 文件大小1.1k ---> [failed request] :0 [time per request]:1.3~1.4 ms
    _isWriting = false,
    _existsTpl = false;

//构造函数
//这里本来想使用单例，但是存在问题是
//单例在高并发的时候会产生冲突
function View(res,cache,time){
    var self = this;

    if(self == global){
        return new View(res,cache,time);
    }else{
        self._res = res;
        self.setCache(cache,time);

        //第一次初始化的时候检测一下
        if(!_existsTpl){
            var _flag = fs.existsSync(_config.template_path);

            if(!_flag){
                fs.mkdirSync(_config.template_path);
            }
            _existsTpl = true;
        }
    }

    //self._time = +new Date();
}

//是否缓存
View.prototype.setCache = function(cache,time){
    var self = this;

    self._cache = cache ? cache : false;
    self._time = time ? time : 0;
};

// 模板赋值
View.prototype.assign = function(data){
    var self = this;
    self._data = data;
}

// 显示模板,此函数涉及到的功能太多...需要精简一下
View.prototype.display = function(filePath){
    var self = this,
        _path = self._path,
        _str = '',
        _index = 0,
        _filename = '';

    _path = filePath ? filePath : _path;
    self._path = _path;

    //如果不存在path就直接抛异常
    if(!_path){
        throw new Error("lost {path} param");
    }else{
        _index = self._path.lastIndexOf("/");
        _filename = _config.serialize_path +"/"+ path.basename(_path) + ".nhtml";

        self._filename = _filename;

        _parseInfo[_path] = _parseInfo[_path] ? _parseInfo[_path] : false;

        fs.exists(_filename,function(exists){

            // 若匹配后的模板文件存在，则读取匹配后的模板文件
            // 否则的话，读取原始的模板文件
            var _filePath = exists ? _filename : _path;

            // 如果需要静态化文件，则将对应的文件信息保存
            if(_config.cache || self._cache){
                var _fileInfo = self._pushCacheInfo(_path),
                    _cacheTime = self._time || _config.cacheTime;

                // 模板未被解析过,则进行【一次】解析,以防止跟下面的write有冲突
                // 这种情况一般是进程刚启用的时候
                if(!exists && !_parseInfo[_path]){
                    _parseInfo[_path] = true;
                    self._readTpl(_filePath,true);
                }else{

                    // 若缓存时间没到，那么就直接返回缓存的文件内容即可
                    // 否则直接保存缓存文件及信息
                    if(_fileInfo.utime - _fileInfo.ctime <  _cacheTime * 1000){
                        self._readTpl(_filePath,false);
                    }else{
                        delete _files[_path];
                        self._pushCacheInfo(_path);
                        self._readTpl(_path,true);
                    }
                }
            }else{
                self._readTpl(_filePath,false);
            }
        })
    }
}

//读取模板并解析，返回数据
View.prototype._readTpl = function(_filePath,_toParse){
    var self = this;

    if(!_isWriting){
        _read(_filePath,_toParse);
    }else{
        self._nextLoop(function(){
            _read(_filePath,_toParse);
        });
    }

    function _read(_filePath,_toParse){

        if(_isWriting){
            self._nextLoop(function(){
                _read(_filePath,_toParse);
            });

            return;
        }

        fs.readFile(_filePath,function(err,data){

            //缺少log.js
            if(err) throw err;

            self._str = data.toString("utf-8");

            //解析模板
            if(_toParse){
                self._replaceNotes()
                    ._matchTplStr();
            }
            //console.log((+new Date()-self._time)/1000);
            self._res.writeHead(200,{"Content-Type":"text/html"});
            self._res.write(self._str);
            self._res.end();
        })
    };
}

//清除模板中的单行注释、制表符、回车和多行注释
//请注意清除的顺序，必须是需要单行注释先清除的
View.prototype._replaceNotes = function(){
    var self = this,
        _str = self._str;

                //第一步，清空单行注释
    self._str = _str.replace(/\/\/.*/g,'')
                //第二步，清除制表符、回车
               .replace(/(\r\n)+|\  /g,'')
                //第三步，清楚多行注释
               .replace(/\/\*.*\*\//,'')
                //第四部，转义单引号
               .replace(/['"]/,"\$1");
    return self;
}

//匹配模板字符串
//利用new Function返回运行后的字符串
View.prototype._matchTplStr = function(){
    var self = this,
        _str = self._str,
        _regStr = _config.lefter+"\\\s*(.*?)\\\s*"+_config.righter,
        _reg = new RegExp(_regStr,"g"),
        _match = [],
        _position = 0,
        _strArr = ["var str = '';"],
        _basename = path.basename(self._filename),
        _serPath = _config.cache || self._cache ? _config.serialize_path +"/" + _basename : '';

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

    if(_config.cache || self._cache){
        if(!_isWriting){
            self._writeToFile(self._str,_serPath);
        }else{
            self._nextLoop(function(){
                self._writeToFile(self._str,_serPath);
            })
        }
    }

    return self;
}

//文件保存
View.prototype._writeToFile = function(_data,_filePath){
    var self = this,
        _path = path.dirname(_filePath),
        _index = 0;

    if(_isWriting){
        self._nextLoop(function(){
            self._writeToFile(self._str,_serPath);
        });
    }

    _isWriting = true;

    fs.mkdir(_path,function(err){

        if(err){}

        fs.writeFile(_filePath,_data,function(err){
            //缺少log.js
            if(err) throw err;

            _isWriting = false;
        });
    });
}

//保存静态化文件信息
View.prototype._pushCacheInfo = function(_filePath){
    var self = this,
        _ctime,_utime;

    if(_files[_filePath]){
        _utime = +new Date();
        _files[_filePath].utime = _utime;
    }else{
        _ctime = _utime = +new Date();

        _files[_filePath] = {
            name : _filePath,
            ctime : _ctime,
            utime : _utime
        };
    }

    return _files[_filePath];
}

//放入下一个事件循环中
//此处必须使用setImmediate
//原因在于process.nextTick在10.0.3版本中无法循环引用
//应该会在下一个版本中修复
View.prototype._nextLoop = function(_fn){
    setImmediate(_fn);
}

module.exports = View;




