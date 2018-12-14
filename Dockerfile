FROM mhart/alpine-node:10
WORKDIR /app
COPY . ./
RUN npm install
RUN npm run build -- --dest /public
