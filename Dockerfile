FROM node:10-alpine
WORKDIR /usr/src
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
ENTRYPOINT ["npm"]
CMD ["start"]
