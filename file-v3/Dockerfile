FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && cp -R src/view dist/view && npm prune --omit=dev

FROM node:20-alpine

ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY package*.json ./

EXPOSE 8080
CMD ["npm", "run", "start:prod"]
