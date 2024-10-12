// Dependencies
const dotenv = require('dotenv');
const express = require('express');
const axios = require('axios');
const app = express();
// Routes
const vesselRoutes = require('./routes/vessels');
const { fetchSeaRoute } = require("./searoute");
const fetchNewsByDateAndCategory = require('./service/NewsService')
//import { fetchNewsByDateAndCategory } from './service/NewsService';

// Middleware
app.use(express.json()); //Parse incoming JSON
dotenv.config(); // load .env into environment variables

fetchNewsByDateAndCategory("2005-09-23","Weather");

// Welcome
app.get('/', (req, res) => {
  res.send('Maritime Port Management API is running.');
});

app.get("/sea-route", fetchSeaRoute);


// Route paths
app.use('/api/vessels', vesselRoutes);  // API route for vessels



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});