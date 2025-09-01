# Stage 1: Build dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies needed to compile native modules
RUN apk add --no-cache python3 make g++ gcc && \
    ln -sf python3 /usr/bin/python

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the Next.js app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js
RUN npm run build

# Stage 3: Runtime image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000

# Add a non-root user for security
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001

# Copy only the production build output
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
