ARG PORT
FROM timbru31/node-alpine-git:16

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY .npmrc /usr/src/app/
COPY package.json /usr/src/app/

RUN npm cache clean --force
RUN npm install --save --legacy-peer-deps
RUN npm install pm2@latest -g
RUN npm install -g knex

COPY . /usr/src/app

EXPOSE $PORT

CMD [ "npm", "run", "pokedex-server" ]
