#!/bin/bash

# Write the variables to a .env file
cat <<EOF > .env
OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASSWORD=${EMAIL_PASSWORD}
EOF

echo ".env file created with provided configurations."
