function setRouter(router) {
    router.prefix('/'); //设置路由前缀

    router.get('/', function(ctx, next) {
        ctx.body = 'hello,koa2 api';
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

    router.get('/api/test', async (ctx, next) => {
        ctx.body = {
            title: 'koa2 json',
            user: 'heige'
        }
    });
    router.get('/api/info', helper.ware('common', 'setCommonHeader'), helper.controller('Index', 'index'));
    router.get('/api/demo', helper.controller('api/Demo', 'index'));
    return router;
}

module.exports = setRouter;
