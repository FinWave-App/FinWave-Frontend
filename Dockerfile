FROM node:20.5-alpine
MAINTAINER isKONSTANTIN <me@knst.su>

EXPOSE 3000

WORKDIR /finwave

COPY .output/ ./

ENTRYPOINT ["node", "server/index.mjs"]