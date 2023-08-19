# Install dependencies only when needed
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN npx pnpm i --no-frozen-lockfile

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules
RUN npx pnpm run build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

RUN adduser -S torwent -D -u 10000 -s /bin/nologin
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY stack.env ./.env

USER 10000
EXPOSE 8080
CMD ["node", "./build"]