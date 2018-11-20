function setRouter(router) {
    router.prefix('/'); //设置路由前缀

    router.get('/', function(ctx, next) {
        ctx.body = 'hello,koa2 api';
    });

    //模拟throw,抛出异常处理
    router.get("/test-error", function(ctx, next) {
        // ctx.throw(401, "unlogin");
        ctx.throw(401, {
            message: "unlogin"
        });
    });

    router.get('/test', helper.controller('Index', 'test'));

    router.get('/bar', function(ctx, next) {
        ctx.body = 'this is a bar response'
    });

    router.get('/info', async (ctx, next) => {
        ctx.body = 'koa2 info'
    })

    router.get('/json', async (ctx, next) => {
        ctx.body = {
            title: 'koa2 json'
        }
    });

    //axios测试
    router.get('/api/test', helper.controller('api/Demo', 'test'));

    //helper.get/helper.post方法测试
    router.get('/api/get-data', helper.controller('api/Demo', 'getData'));
    router.post('/api/post-data', helper.controller('api/Demo', 'testPost'));
    router.get('/api/info', helper.ware('common', 'setCommonHeader'), helper.controller('Index', 'index'));
    router.get('/api/demo', helper.controller('api/Demo', 'index'));

    return router;
}

module.exports = setRouter;
