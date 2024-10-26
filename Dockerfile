# Use Node.js as the base image
FROM node:20

# Set up backend working directory
WORKDIR /app

# Copy backend files
COPY package*.json ./
COPY app.js ./
COPY db.js ./
COPY routes ./routes
COPY models ./models
COPY controllers ./controllers
COPY cron-jobs ./cron-jobs

# Install backend dependencies
RUN npm install

# Set up frontend files
COPY ./frontend/weather-app /frontend/weather-app
WORKDIR /frontend/weather-app

# Install frontend dependencies
RUN npm install

# Expose the necessary ports (backend 5000, frontend 3000, adjust if different)
EXPOSE 5000 3000

# Script to create the .env file
WORKDIR /app
COPY create-env.sh /app/create-env.sh
RUN chmod +x /app/create-env.sh

# Start backend server, cron jobs, and frontend app
CMD ["bash", "-c", "/app/create-env.sh && npm start & node cron-jobs/weatherUpdate.js & cd /frontend/weather-app && npm start"]
