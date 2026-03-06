FROM node:20

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm ci

# Copy project files
COPY . .

# Build
RUN npm run build

# Start
CMD ["npm", "start"]
