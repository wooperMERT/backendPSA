const https = require('https');
const axios = require('axios');
const { dijkstraWithWaitTimes, reconstructPath } = require('./shortestPath'); // Import Dijkstra functions

const SEAROUTE_API_BASE_URL = "https://api.searoutes.com/route/v2/sea";
const SEAROUTE_API_KEY = 'pM9h92tCa74wLGKp2R3v53dRclX48M1N861YvTOh';

// Create an HTTPS agent with SSL verification disabled
const agent = new https.Agent({
    rejectUnauthorized: false,
});

// Function to calculate sea route with waypoints for each leg
const calculateSeaRouteWithWaypoints = async (startCoordinates, endCoordinates, avoidZones) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `${SEAROUTE_API_BASE_URL}/${startCoordinates.join(",")};${endCoordinates.join(",")}/plan`,
            headers: {
                accept: 'application/json',
                'x-api-key': SEAROUTE_API_KEY,
            },
            params: {
                continuousCoordinates: true,
                avoidSeca: true,
                avoidHRA: true,
                blockAreas: avoidZones,
            },
            httpsAgent: agent,
        });

        const distance = response.data.features[0].properties.distance;
        const waypoints = response.data.features[0].geometry.coordinates;
        return { distance, waypoints };
    } catch (error) {
        console.error("Error fetching sea route:", error.response ? error.response.data : error.message);
        return { distance: Infinity, waypoints: [] }; // Return large distance and empty waypoints on failure
    }
};

// Function to calculate and return waypoints and port order
const getWaypointsAndPortOrder = async (portOrder, avoidZones) => {
    let totalNewDistance = 0;
    let allWaypoints = [];

    console.log("New Port Order (Shortest Path with All Ports):");
    for (let i = 0; i < portOrder.length - 1; i++) {
        const start = portOrder[i].geopoint;
        const end = portOrder[i + 1].geopoint;
        const { distance, waypoints } = await calculateSeaRouteWithWaypoints(start, end, avoidZones);

        totalNewDistance += distance;
        allWaypoints.push(...waypoints); // Combine waypoints from each leg

        console.log(`Distance from ${portOrder[i].name} to ${portOrder[i + 1].name}: ${distance} meters`);
    }

    return {
        totalNewDistance,
        portOrder,  // Returning the port order
        allWaypoints,  // Returning all waypoints combined
    };
};

// // Main function
// const main = async () => {
//     const portOrder = [
//         { geopoint: [0.0811, 51.5074], name: 'London', time: Date.now() },
//         { geopoint: [4.47917, 51.925], name: 'Rotterdam', time: Date.now() + 3600000 },
//         { geopoint: [9.9716, 53.5413], name: 'Hamburg', time: Date.now() + 7200000 },
//     ];

//     const avoidZones = [11133];  // Example avoid zones

//     // Call the extracted function to get the waypoints and port order
//     const result = await getWaypointsAndPortOrder(portOrder, avoidZones);

//     console.log("Total New Route Distance:", result.totalNewDistance, "meters");
//     console.log("New Port Order:", result.portOrder);
//     console.log("Combined Waypoints for Full Route:", result.allWaypoints);
// };

// // Start the process
// main();

// Export the getWaypointsAndPortOrder function for reuse
module.exports = {
    getWaypointsAndPortOrder
};