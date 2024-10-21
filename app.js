const express = require('express');
const weatherRoutes = require('./routes/weatherRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/weather', weatherRoutes);
app.use('/alerts', alertRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
