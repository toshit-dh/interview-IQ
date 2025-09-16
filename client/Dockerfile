# Use Node 20 image
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose dev server port
EXPOSE 5173

# Start Vite dev server (hot reload)
CMD ["npm", "run", "dev"]
