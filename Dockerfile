# ---- Stage 1: Build ----
FROM oven/bun:1.3.13-slim AS builder

WORKDIR /app

# Copy lockfile and package.json first to leverage layer caching
COPY package.json bun.lock ./

# Install dependencies exactly as pinned in the lockfile
RUN bun install --frozen-lockfile

# Copy the rest of the source (minus what's in .dockerignore)
COPY . .

# Vite build (includes vue-tsc type-check)
RUN bun run build

# ---- Stage 2: Serve ----
FROM nginx:stable-alpine-slim AS runtime

# Remove the default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our SPA config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
