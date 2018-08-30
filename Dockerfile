FROM mhart/alpine-node:10 as base
WORKDIR /usr/src
COPY . .
RUN npm install
ENV NODE_ENV="production"
RUN npm run build
RUN npm prune

FROM mhart/alpine-node:base-10
WORKDIR /usr/src
ENV NODE_ENV "production"
ENV HOST 0.0.0.0
ENV PORT 3000
COPY --from=base /usr/src .
EXPOSE 3000
ENTRYPOINT ["node"]
CMD ["./node_modules/.bin/nuxt", "start"]
