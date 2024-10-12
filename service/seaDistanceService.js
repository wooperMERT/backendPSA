const https = require('https');
const axios = require('axios');
const { dijkstraWithWaitTimes, reconstructPath } = require('./shortestPath'); // Import Dijkstra functions

const SEAROUTE_API_BASE_URL = "https://api.searoutes.com/route/v2/sea";
const SEAROUTE_API_KEY = '';

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

// Function to build an adjacency list (graph) of distances and waypoints between ports
const buildAdjacencyList = async (portOrder, avoidZones) => {
    const adjList = Array(portOrder.length).fill(null).map(() => []);
    const waypointsMatrix = Array(portOrder.length).fill(null).map(() => []);

    for (let i = 0; i < portOrder.length; i++) {
        for (let j = 0; j < portOrder.length; j++) {
            if (i !== j) {
                const start = portOrder[i].geopoint;
                const end = portOrder[j].geopoint;
                const { distance, waypoints } = await calculateSeaRouteWithWaypoints(start, end, avoidZones);

                // Store both the distance and the waypoints
                adjList[i].push([j, distance]);
                waypointsMatrix[i].push(waypoints);
            }
        }
    }
    return { adjList, waypointsMatrix };
};

// Function to get new port order and waypoints for each leg using Dijkstra's algorithm
const getWaypointsAndPortOrder = async (portOrder, avoidZones) => {
    // Step 1: Build the adjacency list with distances and waypoints
    const { adjList, waypointsMatrix } = await buildAdjacencyList(portOrder, avoidZones);

    const startCity = 0;  // Assume starting from the first port in the order
    const { distances, previousCity } = dijkstraWithWaitTimes(startCity, adjList, Array(portOrder.length).fill(0));  // Step 2: Apply Dijkstra

    // Reconstruct the shortest path
    const newPortOrderIndexes = reconstructPath(previousCity, portOrder.length - 1);

    // Reorder the ports based on the shortest path
    const newPortOrder = newPortOrderIndexes.map(index => portOrder[index]);

    // Step 3: Gather waypoints for each leg in the new port order
    let totalNewDistance = 0;
    const waypointsPerLeg = [];

    for (let i = 0; i < newPortOrderIndexes.length - 1; i++) {
        const startIndex = newPortOrderIndexes[i];
        const endIndex = newPortOrderIndexes[i + 1];

        totalNewDistance += adjList[startIndex][endIndex][1];  // Add the stored distance
        waypointsPerLeg.push(waypointsMatrix[startIndex][endIndex]);  // Add waypoints for this leg
    }

    return {
        totalNewDistance,
        portOrder: newPortOrder,  // Returning the reordered port order
        waypointsPerLeg,  // Returning an array of waypoints for each leg
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