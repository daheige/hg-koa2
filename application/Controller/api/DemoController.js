const axios = require("axios");

let DemoController = {
    index: function(ctx, next) {
        ctx.body = "this is api test logic: " + helper.logic('Test').test()
    },

    /*=======================如下三种不同方式调用接口========*/
    //采用async+await方式异步调用接口
    test: async function(ctx, next) {
        // axios调用后是一个promise
        let r = await axios.get('http://localhost:8080', '/test');
        // console.log("res: ", r);
        helper.AjaxReturn(ctx, r);
    },
    getData: async function(ctx, next) {
        // helper.get调用后是一个promise
        let r = await helper.get('http://localhost:8080', '/test');
        // console.log("res: ", r);
        helper.AjaxReturn(ctx, r);
    },
    testPost: async function(ctx, next) {
        // helper.get调用后是一个promise
        let r = await helper.post('http://localhost:8080', '/home/post');
        console.log("======res=====", r);
        helper.AjaxReturn(ctx, r);
    }
};

module.exports = DemoController;
