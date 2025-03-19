FROM node:20-alpine

WORKDIR /server

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create volume for persistent data
VOLUME /app/data

# Expose port
EXPOSE 8765

# Start the server
CMD ["node", "advanced-server.js"]