FROM node:alpine as BASE

WORKDIR /opt/app
RUN apk add --no-cache  yarn dumb-init

COPY --chown=node:node yarn.lock .
COPY --chown=node:node .yarnrc.yml .
COPY --chown=node:node .yarn/ .yarn/

COPY --chown=node:node package.json .
COPY --chown=node:node tsconfig.base.json .

COPY --chown=node:node prisma ./prisma

ENV NODE_OPTIONS="--enable-source-maps"

ENTRYPOINT ["dumb-init", "--"]

FROM BASE as DEVELOPMENT
ENV NODE_ENV="development"
USER node

CMD [ "yarn", "run", "dev"]

FROM BASE as BUILD
RUN yarn install --immutable
COPY . /opt/app

RUN yarn prisma generate
RUN yarn run build

FROM BASE as PRODUCTION
ENV NODE_ENV="production"

COPY --from=build /opt/app/build /opt/app/build
COPY --from=build /opt/app/node_modules /opt/app/node_modules
COPY --from=build /opt/app/package.json /opt/app/package.json

RUN chown node:node /opt/app
USER node

CMD [ "yarn", "run", "start" ]
