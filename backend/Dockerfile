FROM node:15-alpine

WORKDIR /usr/src/app

COPY package.json ./

RUN yarn install

COPY routes ./routes
COPY bin ./bin
COPY public ./public
COPY app.js ./app.js
COPY create-auth-middleware.js ./create-auth-middleware.js

# Env variables
COPY .env ./.env

EXPOSE 3000
CMD [ "yarn", "start" ]




