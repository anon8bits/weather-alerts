# Use Node.js as the base image
FROM node:20

# Set up working directory
WORKDIR /app

# Copy backend package files first and install dependencies
COPY package*.json ./
RUN npm install

# Copy backend files
COPY app.js ./
COPY db.js ./
COPY routes/ ./routes/
COPY models/ ./models/
COPY controllers/ ./controllers/
COPY cron-jobs/ ./cron-jobs/

# Copy the create-env.sh script and make it executable
COPY create-env.sh ./
RUN chmod +x create-env.sh

# Set up frontend
WORKDIR /app/frontend/weather-app
COPY frontend/weather-app/package*.json ./
RUN npm install

# Copy frontend files
COPY frontend/weather-app/ ./

# Go back to app root
WORKDIR /app

# Expose ports
EXPOSE 5000 3000

# Create a startup script
RUN echo '#!/bin/bash\n\
./create-env.sh\n\
node cron-jobs/weatherUpdate.js &\n\
cd /app && npm start &\n\
cd /app/frontend/weather-app && npm start\n\
wait' > /app/start.sh

RUN chmod +x /app/start.sh

# Set the startup script as the entry point
CMD ["/app/start.sh"]