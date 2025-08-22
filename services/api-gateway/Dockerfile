# syntax=docker/dockerfile:1

# ---- 1. Builder Stage ----
# This stage installs ALL dependencies (dev and prod) and builds the app.
ARG NODE_VERSION=22.18
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install ALL dependencies, including devDependencies needed for the build
RUN npm ci

# Copy the rest of the source code
COPY . .

# Now, run the build. The dependencies (like @nestjs/cli) are already installed.
RUN npm run build


# ---- 2. Runtime Stage ----
# This stage creates the final, lean image with only what's needed to run.
FROM node:${NODE_VERSION}-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Copy production dependencies from the builder stage
# This avoids reinstalling and keeps the image small
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Copy the compiled application code
COPY --from=builder /app/dist ./dist

# Copy your entrypoint script
COPY <<'EOF' /entrypoint.sh
#!/bin/sh
set -e
# Wait for Auth public key up to 60s
KEY_PATH="/shared/keys/auth_public.pem"
for i in $(seq 1 60); do
  if [ -f "$KEY_PATH" ]; then break; fi
  echo "Waiting for public key at $KEY_PATH... ($i/60)"
  sleep 1
done
if [ -z "${PUBLIC_KEY}" ] && [ -f "$KEY_PATH" ]; then
  export PUBLIC_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n", $0; }' "$KEY_PATH")"
fi
exec node dist/main.js
EOF
RUN chmod +x /entrypoint.sh

EXPOSE 3000
CMD ["/entrypoint.sh"]