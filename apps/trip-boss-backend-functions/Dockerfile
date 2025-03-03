ARG NODE_VERSION=20
ARG APP_DIRNAME=trip-boss-backend-functions
ARG PROJECT=trip-boss-backend-functions

# 1. Alpine image
FROM node:${NODE_VERSION}-alpine AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat

FROM alpine AS base
RUN npm install turbo pnpm --global

RUN pnpm config set store-dir ~/.pnpm-store

# 2. Prune projects
FROM base AS pruner
# https://stackoverflow.com/questions/49681984/how-to-get-version-value-of-package-json-inside-of-dockerfile
# RUN export VERSION=$(npm run version)

ARG PROJECT

# Set working directory
WORKDIR /app

# It might be the path to <ROOT> turborepo
COPY . .

RUN turbo prune ${PROJECT} --docker

# 3. Build the project
FROM base AS builder
ARG PROJECT
ARG APP_DIRNAME

# Environment to skip .env validation on build
ENV CI=true

WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

RUN pnpm build --filter=${PROJECT}

RUN chmod a+x ./apps/${APP_DIRNAME}/entrypoint.sh

# 4. Final image - runner stage to run the application
FROM base AS runner
ARG APP_DIRNAME

# Don't run production as root
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nestjs
# USER nestjs

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# COPY --from=builder --chown=nodejs:nestjs /app .
COPY --from=builder /app .
WORKDIR /app/apps/${APP_DIRNAME}

ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}

ARG ENV=prod
ENV ENV=${ENV}

ENTRYPOINT [ "./entrypoint.sh" ]
