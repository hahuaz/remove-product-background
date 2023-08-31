# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /frontend

COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that your Vite server listens on
EXPOSE 3000

# Command to start your Vite server
CMD ["npm", "run", "dev"]