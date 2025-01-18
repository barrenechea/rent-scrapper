# ---
FROM node:23-bookworm-slim AS dev-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---
FROM node:23-bookworm-slim AS prd-deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=dev-deps /app/node_modules ./node_modules
RUN npm prune --omit=dev

# ---
FROM node:23-bookworm-slim AS builder

ENV APPDIR=/app
WORKDIR $APPDIR

COPY . .
COPY --from=dev-deps /app/node_modules ./node_modules

RUN npm run build

# ---
FROM node:23-bookworm-slim AS runner

ENV NODE_ENV=production
ENV APPDIR=/app

RUN mkdir -p $APPDIR && chown -R node:node $APPDIR
WORKDIR $APPDIR

COPY --from=prd-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

USER node
CMD [ "node", "--experimental-default-type=module", "dist/index.js" ]
