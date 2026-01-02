# Stage 1: Build (使用 Node)
FROM node:20-slim AS builder

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
# 用 Node 建置，但產出 Bun preset
RUN NITRO_PRESET=bun pnpm run build

# Stage 2: Production (使用 Bun 執行)
FROM oven/bun:1-slim

WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]
