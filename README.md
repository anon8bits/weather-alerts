# Weather Alert System

A full-stack application built with Node.js, Express, React, and Socket.io for real-time weather updates and alerts. This application fetches weather data from the OpenWeather API and allows users to set alerts based on specific weather conditions.

## Features

- Fetches real-time weather data for Indian metro cities.
- Users can set up email alerts for temperature and weather conditions.
- Real-time updates via Socket.io.
- Frontend built with React.js.

## Docker Image

The Docker image for this app can be found [here](https://hub.docker.com/r/darthyoda1/weather-app).

To run the app, ensure you have the following installed on your local machine:

- [Docker](https://www.docker.com/get-started)

After installation, choose a directory to run the app.

```bash
mkdir weatherapp
cd weatherapp
```

Create an env file with the following fields (ensure no whitespaces):

```bash
OPENWEATHER_API_KEY={YOUR API KEY}
EMAIL_USER={YOUR SMTP EMAIL}
EMAIL_PASSWORD={YOUR SMTP PASSWORD}
```

Pull the docker image:

`docker pull darthyoda1/weather-app`

Before running the image, make sure ports 3000 and 5000 are free. Run the image:

`docker run --env-file .env -p 5000:5000 -p 3000:3000 darthyoda1/weather-app`

This will start the frontend on port 3000 and the backend on port 5000.

Now you can view the weather data and set alerts by visiting `localhost:3000`.


## Prerequisites

To work on the source code and add and test your own features, you need these packages:

- package manager (npm or yarn)
- nodejs (>=18.0.0)
- [OpenWeather API key](https://openweathermap.org/api)
- SMTP provider 

## Getting Started

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/weather-alert-system.git
cd weather-alert-system
```

### Step 2: Install required packages

```bash
npm install

cd frontend/weather-app

npm install
```

This will install the required packages for both the frontend and the backend.

Now you can run the app locally and make changes to the code.