# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.18


FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run build


FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

# Copy production dependencies from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json* ./
RUN npm ci --omit=dev


# Copy the compiled application code from the builder stage
COPY --from=builder /app/dist ./dist


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
if [ -z "${AUTH_PUBLIC_KEY}" ] && [ -f "$KEY_PATH" ]; then
  export AUTH_PUBLIC_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n", $0; }' "$KEY_PATH")"
fi
node ./node_modules/moleculer/bin/moleculer-runner.js --config dist/moleculer.config.js dist/**/*.service.js
EOF
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
