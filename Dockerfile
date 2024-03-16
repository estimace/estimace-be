FROM node:20.11-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /opt/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn --frozen-lockfile

# Production image, copy all the files and run the app
FROM base
WORKDIR /opt/app

COPY --from=deps /opt/app/node_modules ./node_modules
COPY . .

ARG DB_TYPE=pg
ARG DB_CONNECTION_STRING
ARG AUTH_TOKEN_SEED
ARG PLAYERS_PER_ROOM_LIMIT=30
ARG BG_TASK_GARBAGE_COLLECT_ROOMS_ENABLED=true
ARG ROOM_TTL=2592000000

ENV NODE_ENV=production
ENV DB_TYPE=$DB_TYPE
ENV DB_CONNECTION_STRING=$DB_CONNECTION_STRING
ENV AUTH_TOKEN_SEED=$AUTH_TOKEN_SEED
ENV PLAYERS_PER_ROOM_LIMIT=$PLAYERS_PER_ROOM_LIMIT
ENV ROOM_TTL=$ROOM_TTL

EXPOSE 4010

CMD ["yarn", "start"]