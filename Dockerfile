FROM node:10-alpine as build-stage
WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=development
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

# production stage
FROM nginx:1.13.12-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
