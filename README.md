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
# nginx conf
    # nginx配置
    server {
        listen 80;
        set $root_path /web/hg-koa2/public;
        root $root_path;
        server_name hgkoa.com www.hgkoa.com;

        #访问日志设置
        access_log /projects/wwwlogs/hgkoa.com-access.log;
        error_log /projects/wwwlogs/hgkoa.com-error.log;
        #error_page 404 /usr/share/nginx/html/40x.html;

        #error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/share/nginx/html;
        }

        location @nodejs {
            proxy_http_version 1.1;         #http 版本
            proxy_set_header Host $host;    #为反向设置原请求头
            proxy_set_header X-Read-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Upgrade $http_upgrade; #设置WebSocket Upgrade
            proxy_set_header Connection "upgrade";
            proxy_set_header X-NginX-Proxy true;
            proxy_set_header X-Request-Uri $request_uri;
            proxy_set_header X-Referer $http_referer;
            proxy_pass http://localhost:1337;
        }

        location / {
            try_files $uri @nodejs;
        }

        location ~ .*\.(gif|jpg|png|css|js|bmp|swf|ico)(.*) {
            root $root_path;
            access_log off;
            expires 30d;
        }
    }
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
# docs
    https://github.com/daheige/koa-docs-Zh-CN
# License
  MIT
