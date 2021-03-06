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
# throw error method
        //程序抛出异常的方法
        //在控制器中直接采用如下方式就可以
        // ctx.throw(401, "unlogin");
        ctx.throw(401, {
            message: "unlogin"
        });
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

        location ~ .*\.(gif|jpg|png|css|js|bmp|swf|ico)$ {
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
    方式1: node app.js
    方式2：采用pm2进程管理(env可以为production/dev/testing/staging)
    pm2 start boot.json　　　             线上环境启动
    pm2 start boot.json --env staging    预发布环境启动
    pm2 start boot.json --env testing    测试环境启动
    pm2 start boot.json --env dev        开发环境启动
# docker容器方式运行
    生成镜像: docker build -t hgkoa-server .
    运行容器: 
    docker run -it --name=hg-koa2 -d -p 1337:1337 -v /data/logs/hgnode:/app/logs hgkoa-server

    如果要指定时区
    docker run -it --name=hg-koa2 -d -p 1337:1337 -v /data/logs/hgnode:/app/logs -e "TZ=Asia/Shanghai" hgkoa-server


    查看容器运行状态
    $ docker ps -a | grep hg-koa2
    CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS              PORTS                    NAMES
    c447c60d4ea7        hgkoa-server       "pm2 start /app/boot…"   About a minute ago   Up About a minute   0.0.0.0:1337->1337/tcp   hg-koa2

# 查看docker pm2 状态
    heige@daheige:~/mywork/hg-koa2$ docker exec -it hg-koa2 pm2 list

    ┌──────────┬────┬─────────┬─────────┬─────┬────────┬─────────┬────────┬──────┬───────────┬──────┬──────────┐
    │ App name │ id │ version │ mode    │ pid │ status │ restart │ uptime │ cpu  │ mem       │ user │ watching │
    ├──────────┼────┼─────────┼─────────┼─────┼────────┼─────────┼────────┼──────┼───────────┼──────┼──────────┤
    │ hg-koa2  │ 0  │ N/A     │ cluster │ 16  │ online │ 0       │ 4m     │ 0.2% │ 46.1 MB   │ root │ enabled  │
    │ hg-koa2  │ 1  │ N/A     │ cluster │ 23  │ online │ 0       │ 4m     │ 0.2% │ 46.0 MB   │ root │ enabled  │
    │ hg-koa2  │ 2  │ N/A     │ cluster │ 30  │ online │ 0       │ 4m     │ 0.2% │ 45.5 MB   │ root │ enabled  │
    │ hg-koa2  │ 3  │ N/A     │ cluster │ 41  │ online │ 0       │ 4m     │ 0.2% │ 45.6 MB   │ root │ enabled  │
    │ hg-koa2  │ 4  │ N/A     │ cluster │ 48  │ online │ 0       │ 4m     │ 0.2% │ 45.5 MB   │ root │ enabled  │
    │ hg-koa2  │ 5  │ N/A     │ cluster │ 63  │ online │ 0       │ 4m     │ 0.2% │ 45.4 MB   │ root │ enabled  │
    │ hg-koa2  │ 6  │ N/A     │ cluster │ 74  │ online │ 0       │ 4m     │ 0.2% │ 45.3 MB   │ root │ enabled  │
    │ hg-koa2  │ 7  │ N/A     │ cluster │ 81  │ online │ 0       │ 4m     │ 0.2% │ 45.9 MB   │ root │ enabled  │
    └──────────┴────┴─────────┴─────────┴─────┴────────┴─────────┴────────┴──────┴───────────┴──────┴──────────┘
     Use `pm2 show <id|name>` to get more details about an app

    heige@daheige:~/mywork/hg-koa2$ docker exec -it hg-koa2 pm2 list
    ┌──────────┬────┬─────────┬─────────┬─────┬────────┬─────────┬────────┬──────┬───────────┬──────┬──────────┐
    │ App name │ id │ version │ mode    │ pid │ status │ restart │ uptime │ cpu  │ mem       │ user │ watching │
    ├──────────┼────┼─────────┼─────────┼─────┼────────┼─────────┼────────┼──────┼───────────┼──────┼──────────┤
    │ hg-koa2  │ 0  │ N/A     │ cluster │ 16  │ online │ 0       │ 4m     │ 0.3% │ 46.1 MB   │ root │ enabled  │
    │ hg-koa2  │ 1  │ N/A     │ cluster │ 23  │ online │ 0       │ 4m     │ 0.3% │ 46.0 MB   │ root │ enabled  │
    │ hg-koa2  │ 2  │ N/A     │ cluster │ 30  │ online │ 0       │ 4m     │ 0.3% │ 45.5 MB   │ root │ enabled  │
    │ hg-koa2  │ 3  │ N/A     │ cluster │ 41  │ online │ 0       │ 4m     │ 0.3% │ 45.6 MB   │ root │ enabled  │
    │ hg-koa2  │ 4  │ N/A     │ cluster │ 48  │ online │ 0       │ 4m     │ 0.3% │ 45.5 MB   │ root │ enabled  │
    │ hg-koa2  │ 5  │ N/A     │ cluster │ 63  │ online │ 0       │ 4m     │ 0%   │ 45.4 MB   │ root │ enabled  │
    │ hg-koa2  │ 6  │ N/A     │ cluster │ 74  │ online │ 0       │ 4m     │ 0%   │ 45.3 MB   │ root │ enabled  │
    │ hg-koa2  │ 7  │ N/A     │ cluster │ 81  │ online │ 0       │ 4m     │ 0.3% │ 45.9 MB   │ root │ enabled  │
    └──────────┴────┴─────────┴─────────┴─────┴────────┴─────────┴────────┴──────┴───────────┴──────┴──────────┘
     Use `pm2 show <id|name>` to get more details about an app

    heige@daheige:~/mywork/hg-koa2$ docker exec -it hg-koa2 pm2 logs hg-koa2 
    [TAILING] Tailing last 15 lines for [all] processes (change the value with --lines option)
    /app/logs/hgkoa-error.log last 15 lines:
    /app/logs/hgkoa-out.log last 15 lines:
    0|hg-koa2  | 2019-03-02 14:21:12: server has run on:  1337
    0|hg-koa2  | 2019-03-02 14:21:12: server has run on:  1337
    0|hg-koa2  | 2019-03-02 14:21:12: server has run on:  1337
    0|hg-koa2  | 2019-03-02 14:21:12: server has run on:  1337
    0|hg-koa2  | 2019-03-02 14:21:12: server has run on:  1337
    0|hg-koa2  | 2019-03-02 14:24:41: request_id:  413875c139e39b263301561cb2e4274f
    0|hg-koa2  | 2019-03-02 14:24:41: write log success!
    0|hg-koa2  | 2019-03-02 14:24:41: =====exec end status==== 200
    0|hg-koa2  | 2019-03-02 14:24:41: GET / - cost:17ms
    0|hg-koa2  | 2019-03-02 14:24:41: write log success!
    0|hg-koa2  | 2019-03-02 14:25:07: request_id:  b49ba4fb1effed8c76898955cabcd251
    0|hg-koa2  | 2019-03-02 14:25:07: write log success!
    0|hg-koa2  | 2019-03-02 14:25:07: =====exec end status==== 200
    0|hg-koa2  | 2019-03-02 14:25:07: GET / - cost:16ms
    0|hg-koa2  | 2019-03-02 14:25:07: write log success!

# docs
    https://github.com/daheige/koa-docs-Zh-CN
# License
  MIT
