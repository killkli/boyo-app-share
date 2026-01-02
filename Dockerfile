# Stage 1: Build
FROM oven/bun AS builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN NITRO_PRESET=bun bun run build

# Stage 2: Production
FROM oven/bun:1-slim

WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]
