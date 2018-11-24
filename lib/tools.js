const crypto = require('crypto');
const querystring = require('querystring');
const axios = require('axios');
const uuidLib = require('node-uuid');
const fs = require('fs');

//日志级别从低到高
const logLevel = {
    debug: 100,
    info: 200,
    notice: 250,
    warn: 300,
    error: 400,
    crit: 500, //临界值错误: 超过临界值的错误
    alter: 550, //警戒性错误: 必须被立即修改的错误
};

//加载通用逻辑容器
function loadLogicFunc(layer, name, group) {
    layer = layer.substring(0, 1).toUpperCase() + layer.substring(1);
    let path = APP_PATH + '/' + layer + '/';
    if (typeof group != 'undefined' && group) {
        path = APP_PATH + '/' + layer + '/' + group + '/';
    }

    if (typeof name == 'undefined') {
        name = 'Base';
    }

    return require(path + name + layer);
};

//用于加载控制器和中间件的动作
function loadLayer(layer = 'Controller', name = 'Index', action = 'index') {
    layer = layer.substring(0, 1).toUpperCase() + layer.substring(1);
    if (name.indexOf('/') > -1) {
        let arr = name.split('/');
        name = arr && arr.length == 2 ? arr[0] + '/' + arr[1] : name;
    }

    let dir = APP_PATH + '/' + layer + '/';
    let filename = require(dir + name + layer);
    return filename[action];
};

function zeroNum(num) {
    return num > 10 ? num : '0' + num;
}

//日志记录
function writeLog(msg = {}, context = {}, level = "info") {
    if (msg == null || msg == '') {
        console.log("write data: ", msg);
        return;
    }

    if (!fs.existsSync(config.log_dir)) {
        fs.mkdirSync(config.log_dir);
    }

    //日志文件
    let myDate = new Date();
    let logFile = [myDate.getFullYear(), myDate.getMonth() + 1, myDate.getDate()].join('-') + '.log';
    //2018-09-09 09:09:09
    let currentTime = [
        myDate.getFullYear(),
        zeroNum(myDate.getMonth() + 1),
        zeroNum(myDate.getDate()),
    ].join('-') + ' ' + [
        zeroNum(myDate.getHours()),
        zeroNum(myDate.getMinutes()),
        zeroNum(myDate.getSeconds())
    ].join(':');

    let ms = myDate.getTime();
    myDate = null;

    //异步写入文件中
    fs.writeFile(config.log_dir + '/' + logFile, JSON.stringify({
        code: !logLevel[level] ? logLevel.info : logLevel[level],
        message: msg,
        context: context || {},
        localTime: currentTime,
        msTime: ms,
    }) + '\n', {
        encoding: 'utf8',
        flag: 'a',
    }, function(err) {
        if (err) {
            console.log('write log file error: ', err);
            return;
        }

        console.log('write log success!');
    });
}

let libs = {
    controller: function(name, action) {
        return loadLayer('Controller', name, action);
    },
    model: function(name, group) {
        return loadLogicFunc('Model', name, group);
    },
    logic: function(name, group) {
        return loadLogicFunc('Logic', name, group);
    },
    service: function(name, group) {
        return loadLogicFunc('Service', name, group);
    },
    md5: function(str) {
        str = String(str);
        return crypto.createHash('md5').update(str).digest('hex');
    },
    uuid: function() {
        return uuidLib.v4();
    },
    formatParams: function(params = {}) {
        if (typeof params == 'object' && Object.keys(params).length) {
            params = querystring.stringify(params);
        } else if (typeof params == 'string' && params) {
            params = encodeURIComponent(params);
        } else {
            params = querystring.stringify(params);
        }

        return params;
    },
    //get请求，返回结果是一个promise
    //请求参数params必须是一个对象
    //返回结果是一个promise
    get: function(baseUrl = '', url = '', params = {}, headers = {}) {
        if (url == null || url == '') {
            return new Promise(function(resolve, reject) {
                reject({
                    status: 500,
                    message: 'url不能为空',
                    data: null,
                });
            });
        }

        //请求参数设置
        let options = {
            method: "GET",
            params: params || {},
            timeout: 5000,
        };

        //baseUrl设置
        if (baseUrl != '' && baseUrl != null) {
            options.baseURL = baseUrl;
        }

        //自定义header头
        if (Object.keys(headers).length) {
            options.headers = headers;
        }

        //创建一个实例
        let instance = axios.create(options);
        return instance.get(url);
    },
    //请求参数params必须是一个对象
    post: function(baseUrl = '', url = '', params = {}, headers = {}) {
        if (url == null || url == '') {
            return new Promise(function(resolve, reject) {
                reject({
                    status: 500,
                    message: 'url不能为空',
                    data: null,
                });
            });
        }

        //请求参数设置
        let options = {
            method: "POST",
            data: params || {},
            timeout: 5000,
        };

        //baseUrl设置
        if (baseUrl != '' && baseUrl != null) {
            options.baseURL = baseUrl;
        }

        //请求头设置
        options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        //自定义header头
        let opt = Object.keys(headers);
        let optLen = opt.length;
        if (optLen) {
            for (let i = 0; i < optLen; i++) {
                let k = opt[i];
                options.headers[k] = headers[k];
            }
        }

        console.log("====current options===", options)
        console.log("====request uri====", url)

        //创建一个实例，这里需要吧options传递进入
        let instance = axios.create(options);
        let res = instance.post(url); //返回结果是一个promise
        /* res.then(function(data) {
             console.log(data);
         }).catch(function(err) {
             console.log('res error: ', err)
         })*/

        return res;
    },
    //用于加载中间件
    ware: function(name, action) {
        return loadLayer('Ware', name, action);
    },
    AjaxReturn: function(ctx, res) {
        //外层http状态码
        if (!res || !res.status || res.status != 200) {
            return ctx.body = {
                code: 500,
                message: "请求错误"
            }
        }

        //处理业务数据
        let data = res.data || null;

        console.log("reply data: ", data);

        if (typeof data == "string") {
            return ctx.body = data;
        }

        if (!data || data.code != 200) {
            return ctx.body = {
                code: 500,
                message: data && data.message ? data.message : "请求错误"
            }
        }

        return ctx.body = data;
    },
    zeroNum: zeroNum,
    /*======================日志处理==========*/
    debugLog: function(data = {}, context = {}) {
        writeLog(data, context, 'debug');
    },
    infoLog: function(data = {}, context = {}) {
        writeLog(data, context, 'info');
    },
    warnLog: function(data = {}, context = {}) {
        writeLog(data, context, 'warn');
    },
    noticeLog: function(data = {}, context = {}) {
        writeLog(data, context, 'notice');
    },
    errorLog: function(data = {}, context = {}) {
        writeLog(data, context, 'error');
    },
    critLog: function(data = {}, context = {}) {
        writeLog(data, context, 'crit');
    },
    alterLog: function(data = {}, context = {}) {
        writeLog(data, context, 'alter');
    }
};
module.exports = libs;
