# Dockerfile
FROM node:18
# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build NestJS app
RUN npm run build

# Expose port Nest runs on
EXPOSE 3000
# Run with auto-reload
CMD ["npm", "run", "start:dev"]

