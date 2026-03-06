FROM node:20-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./
RUN npm ci 

# Copy the rest of the code
COPY . .

# Build
RUN npm run build

# Start
EXPOSE 5000
CMD ["npm", "start"]
