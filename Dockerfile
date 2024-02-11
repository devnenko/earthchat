FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY ./server.ts ./
COPY ./build ./build
CMD npm start
EXPOSE 8080