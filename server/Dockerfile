FROM node:22.14.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

FROM node:22.14.0-alpine
WORKDIR /app
RUN addgroup -S crew && adduser -S -G crew -H -s /sbin/nologin crew
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER crew
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
