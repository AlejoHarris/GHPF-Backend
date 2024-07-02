FROM node:22.3.0-alpine3.20

RUN adduser -H -D app-user

WORKDIR /be

COPY package.json /be/package.json
RUN npm install
COPY app /be/app
COPY server.js /be/server.js

USER app-user

CMD ["npm", "start"]

EXPOSE 3000