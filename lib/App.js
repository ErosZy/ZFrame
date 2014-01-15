/**
 * 核心模块
 * 最主要的方式是中间件的注册、调用
 * 路由、范式路由等核心功能
 *
 * fixed:修复路由注册冲突及无法携带get参数的bug
 */


/**
 * 常量
 * @type {Number}
 */
var GET_TYPE = 1,
    POST_TYPE = 0;

var http = require("http"),
    url = require("url"),
    queryString = require("querystring");

/**
 * App构造函数
 * @constructor
 */
function App(){
    var self = this;

    var _moduleList = self._moduleList = [];

    self._get_router = [];
    self._post_router = [];

    self._server = http.createServer(function(req,res){
        self._handler(req,res);
    });
}

/**
 * 注册server的request事件
 * @param req
 * @param res
 * @private
 */
App.prototype._handler = function(req,res){
    var self = this;

    self._moduleIndex = 0;

    var _module = self._moduleList[self._moduleIndex];

    if(_module){
        self._execModule(req,res,_module);
    }else{
        self._useMethod(req,res);
    }
}

//加入中间件
App.prototype.use = function(module){
    var self = this;
    self._moduleList.push(module);
}

/**
 * 执行中间件
 * @param req
 * @param res
 * @param _module
 * @private
 */
App.prototype._execModule = function(req,res,_module){
    var self = this;

    if(_module){
        _module(req,res,function(){
            self._next(req,res);
        });
    }else{
        self._moduleIndex = 0;
        self._useMethod(req,res);
    }
}

/**
 * 执行下一个中间件
 * @param req
 * @param res
 * @private
 */
App.prototype._next = function(req,res){
    var self = this,
        _moduleIndex = ++ self._moduleIndex;

    var _module = self._moduleList[_moduleIndex];

    self._execModule(req,res,_module);
}

/**
 * GET路由
 * 针对三种情况进行判断：
 * 1./index/:id/:kw；
 * 2./index.html?id=xx&kw=xx；
 * 3./index/*
 *
 * @param url
 * @param callback
 */
App.prototype.get = function(url,callback){
    var self = this,
        _reg = null,
        _params = [];

        //若注册路由中带有querystring的，则清除掉，因为无意义
    var _reg = url.replace(/\?(?:.*)/ig,'')
        //若注册路由中带有*号，则替换为(.*)
        .replace(/\*/ig,'(.*)')
        //若注册路由中带有/:id/:name,则替换为/(.*)/(.*)的正则，并且把id及name保存
        .replace(/:([^\/])*/ig,function(){
            var _item = arguments[0].slice(1);
            _params.push(_item);

            return "(.*)";

        }).replace(/\//g,"\\\/");

    //使任何路由都可以匹配get参数
    _reg = "^"+_reg+"(?:\\\?\\\s*(?:.+\\\s*=\\\s*.+\\\s*))?$";

    self._get_router.push({
        fn:callback,
        //增加边界条件，防止index与index02类似的url均可被访问
        reg:new RegExp(_reg),
        params:_params
    });
}

/**
 * POST路由
 * @param url
 * @param callback
 */
App.prototype.post = function(url,callback){
    var self = this;

    self._post_router.push({
        path : url,
        fn : callback
    })
}

/**
 * 判断是POST还是GET请求
 * GET采取泛式路由，而POST采用简单路由
 * GET支持：1./index/:id/:kw；2./index.html?id=xx&kw=xx；3./index/*
 * POST仅支持：/register/index.html
 * @param req
 * @param res
 * @private
 */
App.prototype._useMethod = function(req,res){
    var self = this,
        _method = req.method,
        _url = "."+req.url,
        _data = {};

    switch(_method){
        case "GET":
            _data = self._getRouter(_url,GET_TYPE);
            self._header(req,res,_data,GET_TYPE);
            break;
        case "POST":
            _data = self._getRouter(_url,POST_TYPE);
            self._header(req,res,_data,POST_TYPE);
            break;
        default:
            self._set404(req,res);
    }
}

/**
 * 获取get请求中的get参数，存放在req.params中
 * @param req
 * @param res
 * @private
 */
App.prototype._setGetParams = function(req,res,data){
    var self = this,
        _query = url.parse(req.url).query,
        _params = {};

    if(_query){
        _params = queryString.parse(_query);
    }else{
        _params = data.params;
    }

    req.params = _params;
}

/**
 * 获取保存中的GET路由的执行函数
 * @param _url
 * @return {Object}
 * @private
 */
App.prototype._getRouter = function(_url,_type){
    var self = this,
        _data = {router:null,isFind:false},
        _getRouter = null,
        _reg = null,
        _isMatch = false,
        _router = [],
        _match = [],
        _params = {},
        _key = [];

    if(_type == GET_TYPE){
        for(var i = 0 , _length = self._get_router.length ; i < _length ; i++){
            _getRouter = self._get_router[i];
            _key = _getRouter.params;
            _reg = _getRouter.reg;
            _isMatch = _reg.test(_url);

            if(_isMatch){
                _match = _url.match(_reg);
                _match = _match.slice(1);

                if(_match.length){
                    for(var j = 0 ,_length = _match.length;j < _length; j++){
                        _params[_key[j]] = _match[j];
                    }
                    _data.params = _params;
                }

                _data.router = self._get_router[i].fn;
                break;
            }
        }
    }else{
        for(var i = 0 , _length = self._post_router.length ; i < _length ; i++){
            if(_url == self._post_router[i].path){
                _isMatch = true;
                _data.router = self._post_router[i].fn;
                break;
            }
        }
    }

    _data.isFind = _isMatch;
    return _data;
}

/**
 * 转交callback函数进行处理
 * @param _data
 * @param req
 * @param res
 * @private
 */
App.prototype._header = function(req,res,_data,_type){
    var self = this;

    if(_data.isFind){
        if(_type == GET_TYPE){
            self._setGetParams(req,res,_data);
        }
        _data.router(req,res);
    }else{
        self._set404(req,res);
    }
}

/**
 * 设置页面404
 * @param req
 * @param res
 * @private
 */
App.prototype._set404 = function(req,res){
    var self = this;

    res.statusCode = 404;
    res.end();
}

/**
 * 监听函数的封装
 */
App.prototype.listen = function(){
    var self = this;
    self._server.listen.apply(self._server,arguments);
}

module.exports = App;