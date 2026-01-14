FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app
COPY package*.json .
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf