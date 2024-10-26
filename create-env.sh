#!/bin/bash

# Prompt the user for each environment variable
echo "Please enter the following information for environment configuration:"
read -p "OPENWEATHER_API_KEY: " OPENWEATHER_API_KEY
read -p "SMTP EMAIL_USER: " EMAIL_USER
read -p "SMTP EMAIL_PASSWORD: " EMAIL_PASSWORD

# Write the variables to a .env file
cat <<EOF > .env
OPENWEATHER_API_KEY=$OPENWEATHER_API_KEY
EMAIL_USER=$EMAIL_USER
EMAIL_PASSWORD=$EMAIL_PASSWORD
EOF

echo ".env file created with provided configurations."
