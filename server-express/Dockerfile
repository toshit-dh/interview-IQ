# 1. Start from Node.js 20 image
FROM node:20

# 2. Set working directory in the container
WORKDIR /app

# 3. Copy package.json and package-lock.json first
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of your source code
COPY . .

# 6. Expose port for backend
EXPOSE 3000

# 7. Start backend server
CMD ["npm", "start"]