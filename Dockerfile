FROM node:18.18.0-alpine3.18

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

COPY package.json yarn.lock ./

RUN YARN_CACHE_FOLDER=/tmp/.yarn_cache yarn --production --frozen-lockfile && rm -rf /tmp/.yarn_cache

COPY . .
CMD [ "node", "js/main.js" ]
