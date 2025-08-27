FROM node:20-alpine

WORKDIR /app

# Install Python and build dependencies
RUN apk add --no-cache python3 make g++ gcc && \
    ln -sf python3 /usr/bin/python

# Set Python path explicitly
ENV PYTHON=/usr/bin/python3

COPY package*.json ./

# Add environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies
RUN npm install -g pnpm && \
    pnpm install --no-frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "dev"]