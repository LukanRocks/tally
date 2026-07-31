FROM node:22-alpine AS base
RUN corepack enable

FROM base AS client-build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY web/package.json ./web/package.json
COPY backend/package.json ./backend/package.json
RUN pnpm install --frozen-lockfile --filter tally-web
COPY web/ ./web/
RUN pnpm -C web build

FROM base AS server-build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY web/package.json ./web/package.json
COPY backend/package.json ./backend/package.json
RUN pnpm install --frozen-lockfile --filter tally-backend
COPY backend/ ./backend/
RUN pnpm -C backend build

FROM base AS production
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY web/package.json ./web/package.json
COPY backend/package.json ./backend/package.json
RUN pnpm install --frozen-lockfile --filter tally-backend --prod
COPY --from=server-build /app/backend/dist ./backend/dist
COPY --from=client-build /app/web/dist ./backend/public
RUN mkdir -p /app/data/covers /app/data/attachments /app/data/avatars

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

EXPOSE 3000

# A misconfigured container stays up to explain itself in the browser rather than
# crash-looping (see backend/src/degraded-app.ts). Without a healthcheck it would
# look perfectly healthy to `docker ps`, Portainer and uptime monitors, so report
# unhealthy unless the database is actually usable.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/v1/system/db-status',r=>{let b='';r.on('data',c=>b+=c);r.on('end',()=>process.exit(r.statusCode===200&&JSON.parse(b).state!=='MISCONFIGURED'?0:1))}).on('error',()=>process.exit(1))"

WORKDIR /app/backend
CMD ["node", "dist/index.js"]
