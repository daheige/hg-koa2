FROM mhart/alpine-node

#安装yarn,pm2
RUN mkdir -p /app/logs && npm install -g yarn && \
yarn config set registry http://registry.npm.taobao.org/ && \
    npm install -g pm2

#设置环境变量
ENV PATH /usr/bin/pm2:/usr/bin/pm2-docker:$PATH

#工作目录
WORKDIR /app

COPY ./package.json /app
RUN [ "yarn", "install"]
COPY . /app/

EXPOSE 1337

# 日志运行目录
VOLUME /app/logs

CMD [ "pm2","start","/app/boot.json","--no-daemon"]

#或者用下面的这个也可以
#CMD [ "pm2-docker","start","/app/boot.json"]
