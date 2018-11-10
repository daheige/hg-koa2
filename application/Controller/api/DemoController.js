module.exports = {
    index: function(ctx, next) {
        ctx.body = "this is api test logic: " + helper.logic('Test').test()
    }
};
