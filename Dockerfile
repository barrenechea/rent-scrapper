FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED 1

ARG DATABASE_URL
ARG BOT_TOKEN

COPY . .
RUN npm ci
RUN node --run build

FROM node:22-alpine as runner
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV HOSTNAME 0.0.0.0

USER node
WORKDIR /app

COPY --chown=node:node public ./public
COPY --chown=node:node --from=build /app/.next/standalone ./
COPY --chown=node:node --from=build /app/public /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
