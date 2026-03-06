FROM node:20-alpine
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm ci --omit=dev=false

# Copy project files
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 5000

# Start
CMD ["npm", "start"]
