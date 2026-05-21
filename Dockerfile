FROM node:20-alpine AS base
RUN corepack enable

FROM base AS client-build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN pnpm install --frozen-lockfile --filter tally-client
COPY client/ ./client/
RUN pnpm -C client build

FROM base AS server-build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN pnpm install --frozen-lockfile --filter tally-server
COPY server/ ./server/
RUN pnpm -C server build

FROM base AS production
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN pnpm install --frozen-lockfile --filter tally-server --prod
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=client-build /app/client/dist ./server/public
RUN mkdir -p /app/data/covers /app/data/attachments /app/data/avatars

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

EXPOSE 3000
WORKDIR /app/server
CMD ["node", "dist/index.js"]
