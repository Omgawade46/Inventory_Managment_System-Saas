FROM node:18-alpine

WORKDIR /app

# Copy root package.json and lockfile
COPY package*.json ./

# Copy workspace package.jsons
COPY packages/common/package.json ./packages/common/
COPY services/inventory-service/package.json ./services/inventory-service/
# We might need other services' package.json if they are deps, but for now this is fine.

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./services/inventory-service/prisma/schema.prisma

CMD ["npm", "run", "dev", "--workspace=@saas/inventory-service"]
