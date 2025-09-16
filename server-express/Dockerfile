FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Use npx nodemon for hot reload
CMD ["npx", "nodemon", "server.js"]
