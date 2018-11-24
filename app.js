const Koa = require('koa');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser');
const koaStatic = require('koa-static');
const koaRouter = require('koa-router')(); //路由实例对象
const helmet = require('koa-helmet'); //防止xss攻击

//设置app网站根目录和application目录
Object.defineProperty(global, 'ROOT_PATH', {
    value: __dirname,
    writable: false,
    configurable: false,
});

Object.defineProperty(global, 'APP_PATH', {
    value: __dirname + '/application',
    writable: false,
    configurable: false,
});

Object.defineProperty(global, 'PUBLIC_PATH', {
    value: __dirname + '/public',
    writable: false,
    configurable: false,
});

//app运行环境和端口
let env_info = {
    NODE_PORT: process.env.NODE_PORT || 1337, //生产环境默认1337
    NODE_ENV: (process.env.NODE_ENV || 'production').toLowerCase(),
}

Object.defineProperty(global, 'ENV_INFO', {
    value: env_info,
    writable: false,
    configurable: false,
});

Object.defineProperty(global, 'APP_ENV', {
    value: env_info.NODE_ENV,
    writable: false,
    configurable: false,
});

//加载系统配置和函数
//导入全局配置文件和系统全局函数
const config = require(ROOT_PATH + '/config/app');
let functions_list = config.functions_list;
global.helper = {};
for (let i in functions_list) {
    if (functions_list[i]) {
        let fnObj = require(ROOT_PATH + '/lib/' + i);
        for (let func in fnObj) {
            if (typeof fnObj[func] != 'function') {
                continue;
            }
            Object.defineProperty(helper, func, {
                value: fnObj[func],
                writable: false,
                configurable: false,
            });
        }
    }
}

delete config.functions_list; //删除functions_list属性
Object.defineProperty(global, 'config', {
    value: config,
    writable: false,
    configurable: false,
});

//实例化koa2对象
const app = new Koa();

//记录每次请求和全局错误处理
app.use(async (ctx, next) => {
    //开始请求分配一个request_id
    let start = new Date();
    let log_id = helper.uuid();
    let request_id = helper.md5(log_id);
    ctx.set('x-request-id', request_id);

    console.log("request_id: ", request_id)
    helper.infoLog('exec begin', {
        log_id: log_id,
        request_id: request_id,
        request_uri: ctx.originalUrl,
        request_path: ctx.path,
        request_data: ctx.method != 'GET' ? ctx.body : ctx.query,
        ip: ctx.ip,
        method: ctx.method,
        ua: ctx.get('User-Agent') || '',
    });

    try {
        await next();
        let ms = new Date() - start;
        console.log("=====exec end status====", ctx.status);
        console.log(`${ctx.method} ${ctx.url} - cost:${ms}ms`);

        if (ctx.status != 200) {
            helper.errorLog('exec error', {
                log_id: log_id,
                request_id: request_id,
            });
        } else {
            helper.infoLog('exec end', {
                log_id: log_id,
                request_id: request_id,
                exec_time: ms + 'ms'
            });
        }

        ctx.set('x-request-time', ms + 'ms');
    } catch (err) {
        //捕捉错误记录日志
        ctx.status = err.statusCode || err.status || 500;
        console.log("code: ", ctx.status);
        helper.errorLog('exec error', {
            log_id: log_id,
            request_id: request_id,
            error: {
                code: ctx.status,
                message: err.message || '',
            }
        });

        console.log("error message: ", err.message || '');
        //开发环境直抛出异常
        if (['dev', 'testing', 'staging'].includes(APP_ENV)) {
            ctx.body = {
                message: err.message
            };
            return
        }

        ctx.body = {
            code: ctx.status,
            message: err.message || "server error!"
        };
    }
});

//系统全局middlewares
app.use(helmet()); //防止xss攻击
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}));
app.use(json()); //json解析

//静态资源目录设置，可以根据项目具体配置，如果走nginx反向代理请注释如下代码
app.use(koaStatic(PUBLIC_PATH)); //静态资源根目录设置

//路由分离，绑定到控制器
const routers = require(APP_PATH + '/router/index')(koaRouter);
app.use(routers.routes(), routers.allowedMethods());

//找不到路由的返回404
app.use(async (ctx, next) => {
    await next();

    ctx.status = 404;
    ctx.body = {
        code: ctx.status,
        message: "Not found!"
    };
});

console.log("server has run on: ", ENV_INFO.NODE_PORT);
app.listen(ENV_INFO.NODE_PORT);
