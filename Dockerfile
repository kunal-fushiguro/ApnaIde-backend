FROM node:18-alpine

WORKDIR /build/app

COPY . .

RUN npm install


EXPOSE 7070 7071

CMD ["npm", "run","dev"]
