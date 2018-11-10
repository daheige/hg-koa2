const crypto = require('crypto');
const querystring = require('querystring');
const http = require('http');
const https = require("https");

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

//用于md5加密字符串
function md5(str) {
    str = String(str);
    return crypto.createHash('md5').update(str).digest('hex');
}

module.exports = {
    //定义常量函数
    define: function(name, value) {
        Object.defineProperty(global, name, {
            value: value,
            enumerable: true
        });
    },
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
    md5: md5,
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
    get(url = '', params = {}) {
        return new Promise(function(resolve, reject) {
            if (typeof url == 'undefined' || url == '') {
                return reject({
                    code: 500,
                    message: 'url不能为空',
                    data: null
                });
            }

            params = this.formatParams(params)
            if (url.indexOf('?') > -1) {
                url += params;
            } else {
                url += '?' + params;
            }

            // console.log(url);
            let httpLib = url.indexOf("https") > -1 ? https : http;
            httpLib.get(url, function(res) {
                let {
                    statusCode
                } = res;
                let contentType = res.headers['content-type'];
                let error;
                if (statusCode != 200) {
                    error = new Error('请求失败\n' + `状态码是${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error('无效的 content-type.\n' +
                        `期望 application/json 但获取的是 ${contentType}`);
                }
                if (error) {
                    // console.log(error.message);
                    res.resume();
                    return reject({
                        code: 500,
                        message: error.message,
                        data: null
                    });
                }
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => {
                    rawData += chunk;
                });

                res.on('end', () => {
                    try {
                        let parsedData = JSON.parse(rawData || '[]');
                        return resolve({
                            code: 200,
                            message: 'ok',
                            data: parsedData
                        });
                    } catch (error) {
                        console.log(error.message);
                        return reject({
                            code: 500,
                            message: error.message,
                            data: null
                        });
                    }
                });
            }).on('error', (error) => {
                console.log('错误：' + error.message);
                return reject({
                    code: 500,
                    message: error.message,
                    data: null
                });
            });
        });
    },
    //post请求，is_format是否要格式化返回数据为对象
    post(url = '', params = {}, is_format = true) {
        return new Promise(function(resolve, reject) {
            if (typeof url == 'undefined' || url == '') {
                return reject({
                    code: 500,
                    message: 'url不能为空',
                    data: null
                });
            }

            params = this.formatParams(params)

            //请求参数组装
            let urlLib = require('url');
            let urlObj = urlLib.parse(url);
            let options = {
                protocol: urlObj.protocol,
                hostname: urlObj.hostname,
                port: urlObj.port ? urlObj.port : 80,
                path: urlObj.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            let httpLib = url.indexOf("https") > -1 ? https : http;
            let req = httpLib.request(options, (res) => {
                // console.log(`状态码: ${res.statusCode}`);
                // console.log(`响应头: ${JSON.stringify(res.headers)}`);
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => {
                    rawData += chunk;
                });

                res.on('end', () => {
                    try {
                        return resolve({
                            code: 200,
                            message: 'ok',
                            data: is_format ? JSON.parse(rawData || '[]') : rawData,
                        });
                    } catch (error) {
                        console.log(error.message);
                        return reject({
                            code: 500,
                            message: error.message,
                            data: null
                        });
                    }
                    console.log('响应中已无数据');
                });
            });

            req.on('error', (e) => {
                console.error(`请求遇到问题: ${e.message}`);
                return reject({
                    code: 500,
                    message: `请求遇到问题: ${e.message}`,
                    data: null
                });
            });

            // 写入数据到请求主体
            req.write(params);
            req.end();
        });
    },
    //用于加载中间件
    ware(name, action) {
        return loadLayer('Ware', name, action);
    },
};
