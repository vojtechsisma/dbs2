FROM node:18

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

COPY .env ./

RUN yarn build

EXPOSE 3001

CMD ["yarn", "start:prod"]