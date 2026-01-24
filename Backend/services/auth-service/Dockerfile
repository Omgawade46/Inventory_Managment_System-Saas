FROM node:18-alpine

WORKDIR /app

# Copy root package.json and lockfile
COPY package*.json ./

# Copy workspace package.jsons
COPY packages/common/package.json ./packages/common/
COPY services/auth-service/package.json ./services/auth-service/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

CMD ["npm", "run", "dev", "--workspace=@saas/auth-service"]
