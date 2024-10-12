const https = require('https');
const axios = require('axios');

const SEAROUTE_API_BASE_URL = "https://api.searoutes.com/route/v2/sea";
const SEAROUTE_API_KEY = 'LpdN0Rqv7S4bcWkHC8JDS5GnSSdL41ZRhl2hvW89';

// Create an HTTPS agent with SSL verification disabled
const agent = new https.Agent({  
  rejectUnauthorized: false
});

// Function to calculate sea route
const calculateSeaRoute = async (startCoordinates, endCoordinates, avoidZones) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `${SEAROUTE_API_BASE_URL}/${startCoordinates.join(",")};${endCoordinates.join(",")}/plan`,
            headers: {
                'accept': 'application/json',
                'x-api-key': SEAROUTE_API_KEY
            },
            params: {
                continuousCoordinates: true,
                avoidSeca: true,
                avoidHRA: true,
                blockAreas: avoidZones
            },
            httpsAgent: agent // Disable SSL verification for testing
        });

        // Log the full response to inspect the structure
        console.log('Full Response:', response.data);

        // Safely check if features array exists and has elements
        if (response.data.features && response.data.features.length > 0) {
            console.log('Sea Route Distance:', response.data.features[0].properties.distance, 'meters');
            console.log('Route Waypoints:', response.data.features[0].geometry.coordinates);
        } else {
            console.error('No route features found in the response.');
        }
    } catch (error) {
        console.error("Error fetching sea route:", error.response ? error.response.data : error.message);
    }
};

// Example coordinates
const startCoordinates = [9.96563, 53.53296];  // Hamburg
const endCoordinates = [0.45069, 51.50304];    // London
const avoidZones = [11112, 11117];  // Example block areas (replace with relevant IDs)

// Call the function
calculateSeaRoute(startCoordinates, endCoordinates, avoidZones);
