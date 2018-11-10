# hg-koa2
    1. 基于nodejs8.4.0+版本和koa2，定制化的nodejs开发框架。
    2. 主要用于api(api-proxy)开发。如需支持服务端ssr渲染，请自行实现nuxt封装。
# dir desc
    .
    ├── app.js                  app启动文件
    ├── application             application目录
    │   ├── Controller          控制器
    │   ├── Logic               逻辑层
    │   ├── Model               模型层
    │   ├── router              路由层
    │   ├── Service             服务层
    │   └── Ware                中间件
    ├── bin
    │   ├── app-cutlog.sh       日志切割脚本
    │   └── app-init.sh         上线脚步
    ├── boot.json               pm2配置文件
    ├── config                  配置文件目录
    │   └── app.js
    ├── lib                     公共函数库
    │   └── tools.js
    ├── logs                    操作日志目录
    │   ├── hgkoa-error.log
    │   ├── hgkoa-out.log
    │   └── pids
    ├── node_modules            npm包
    ├── package.json
    ├── public                  可对访问的目录
    │   └── test.html
    └── yarn.lock

# run app
    1. 安装npm包
        yarn global add pm2
        yarn install
    2. 启动app
    方式1: node bootstrap/www
    方式2：采用pm2进程管理(env可以为production/dev/testing/staging)
    pm2 start boot.json　　　            线上环境启动
    pm2 start boot.json --env staging    预发布环境启动
    pm2 start boot.json --env testing    测试环境启动
    pm2 start boot.json --env dev        开发环境启动
# License
  MIT
