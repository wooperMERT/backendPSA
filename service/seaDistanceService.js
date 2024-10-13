const https = require('https');
const axios = require('axios');
const { dijkstraWithWaitTimes, reconstructPath } = require('./shortestPathService'); // Import Dijkstra functions
const { SourceTextModule } = require('vm');

const SEAROUTE_API_BASE_URL = "https://api.searoutes.com/route/v2/sea";
const SEAROUTE_API_KEY = 'pM9h92tCa74wLGKp2R3v53dRclX48M1N861YvTOh'; // Add your API key here

// Create an HTTPS agent with SSL verification disabled
const agent = new https.Agent({
    rejectUnauthorized: false,
});

// Predefined list of known zones and their corresponding IDs
const knownZoneIds = {
    'panama canal': 11112,
    'suez canal': 11117,
    'dover strait': 11133,
    // Add more known zones and IDs as needed
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to fetch ID based on zone name, checking predefined list first
const getId = async (zoneName) => {
    const lowerZoneName = zoneName.toLowerCase(); // Convert to lowercase for case-insensitive matching

    // Check if the zone is in the predefined list
    if (knownZoneIds[lowerZoneName]) {
        return knownZoneIds[lowerZoneName];
    }

    // If not found in the list, make an API call as fallback
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-api-key': SEAROUTE_API_KEY
        }
    };

    try {
        const response = await fetch(`https://api.searoutes.com/geocoding/v2/area/${zoneName}`, options);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const zoneId = data.features[0].properties.id;
            knownZoneIds[lowerZoneName] = zoneId; // Cache the result
            return zoneId;
        } else {
            throw new Error(`No area found for zone: ${zoneName}`);
        }
    } catch (error) {
        console.error(`Error fetching ID for zone ${zoneName}:`, error.message);
        return null;
    }
};

// Function to convert a list of zone names to their corresponding IDs
const getAvoidZoneIds = async (zones) => {
    const zoneIds = [];
    for (const zone of zones) {
        const id = await getId(zone);
        if (id) {
            zoneIds.push(id);
        }
    }
    return zoneIds;
};

// Cache to store already calculated distances and waypoints
const routeCache = new Map();

const isValidCoordinates = (lat, lon) => {
    const isLatValid = lat >= -90 && lat <= 90;
    const isLonValid = lon >= -180 && lon <= 180;
    
    if (!isLatValid || !isLonValid) {
        console.error(`Invalid coordinates: Latitude: ${lat}, Longitude: ${lon}`);
    }
    
    return isLatValid && isLonValid;
};

// Function to calculate sea route with waypoints for each leg, using cache
const calculateSeaRouteWithWaypoints = async (startCoordinates, endCoordinates, avoidZones) => {
    const cacheKey = `${startCoordinates.join(',')}->${endCoordinates.join(',')}`;

    // Check if the result is already cached
    if (routeCache.has(cacheKey)) {
        return routeCache.get(cacheKey);
    }

    // Convert coordinates to numbers explicitly
    const startLat = parseFloat(startCoordinates[0]);
    console.log(startLat);
    const startLon = parseFloat(startCoordinates[1]);
    const endLat = parseFloat(endCoordinates[0]);
    const endLon = parseFloat(endCoordinates[1]);

    // Validate the coordinates before making the API call
    if (!isValidCoordinates(startLat, startLon) || !isValidCoordinates(endLat, endLon)) {
        console.error("Invalid coordinates detected, skipping API call.");
        console.error(`Start Coordinates: [${startLat}, ${startLon}], End Coordinates: [${endLat}, ${endLon}]`);
        return { distance: Infinity, waypoints: [] }; // Return invalid distance on error
    }

    // Log the coordinates being passed to the API for debugging
    console.log(`Making API call with Start Coordinates: ${startLat},${startLon}, End Coordinates: ${endLat},${endLon}`);

    try {
        await delay(1000); // Adding delay to prevent hitting rate limits

        const response = await axios({
            method: 'GET',
            url: `${SEAROUTE_API_BASE_URL}/${startLon},${startLat};${endLon},${endLat}/plan`,
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
        routeCache.set(cacheKey, { distance, waypoints });
        return { distance, waypoints };
    } catch (error) {
        console.error("Error fetching sea route:", error.response ? error.response.data : error.message);
        return { distance: Infinity, waypoints: [] };
    }
};
// Function to build an adjacency list (graph) of distances and waypoints between ports
const buildAdjacencyList = async (portOrder, avoidZones, startPoint) => {
    const adjList = Array(portOrder.length + 1).fill(null).map(() => []); // +1 for the starting point
    const waypointsMatrix = Array(portOrder.length + 1).fill(null).map(() => []); // +1 for the starting point

    for (let i = 0; i < portOrder.length; i++) {
        const start = startPoint;
        const end = [portOrder[i].latitude, portOrder[i].longitude];

        const { distance, waypoints } = await calculateSeaRouteWithWaypoints(start, end, avoidZones);

        adjList[portOrder.length].push([i, distance]); // The start point is at index portOrder.length
        waypointsMatrix[portOrder.length].push(waypoints);
    }

    for (let i = 0; i < portOrder.length; i++) {
        for (let j = 0; j < portOrder.length; j++) {
            if (i !== j) {
                const start = [portOrder[i].latitude, portOrder[i].longitude];
                const end = [portOrder[j].latitude, portOrder[j].longitude];

                const cacheKey = `${start.join(',')}->${end.join(',')}`;
                const reverseCacheKey = `${end.join(',')}->${start.join(',')}`;

                if (routeCache.has(reverseCacheKey)) {
                    const { distance, waypoints } = routeCache.get(reverseCacheKey);
                    adjList[i].push([j, distance]);
                    waypointsMatrix[i].push(waypoints);
                } else {
                    const { distance, waypoints } = await calculateSeaRouteWithWaypoints(start, end, avoidZones);
                    routeCache.set(cacheKey, { distance, waypoints });

                    adjList[i].push([j, distance]);
                    waypointsMatrix[i].push(waypoints);
                }
            }
        }
    }

    return { adjList, waypointsMatrix };
};

// Function to get new port order and waypoints for each leg using Dijkstra's algorithm
const getWaypointsAndPortOrder = async (portOrder, avoidZoneNames, startPoint) => {
    const avoidZones = await getAvoidZoneIds(avoidZoneNames);

    const { adjList, waypointsMatrix } = await buildAdjacencyList(portOrder, avoidZones, startPoint);

    const startCity = portOrder.length; // The start city is the new node (startPoint), indexed at portOrder.length
    const { distances, previousCity } = dijkstraWithWaitTimes(startCity, adjList, Array(portOrder.length + 1).fill(0));

    const newPortOrderIndexes = reconstructPath(previousCity, portOrder.length - 1);
    const newPortOrder = newPortOrderIndexes.map(index => portOrder[index]);

    let totalNewDistance = distances[portOrder.length - 1];
    const waypointsPerLeg = [];

    for (let i = 0; i < newPortOrderIndexes.length - 1; i++) {
        const startIndex = newPortOrderIndexes[i];
        const endIndex = newPortOrderIndexes[i + 1];
        waypointsPerLeg.push(waypointsMatrix[startIndex][endIndex]);
    }

    const allWaypoints = waypointsPerLeg.flat();

    return {
        totalNewDistance,
        portOrder: newPortOrder,
        waypointsPerLeg,
        allWaypoints,
    };
};

// // Main function
// const main = async () => {
//     const portOrder = [
//         { name: "PSA Mumbai (India)", latitude: 18.9543, longitude: 72.8499 },

//         { name: "PSA Sines (Portugal)", latitude: 37.9568, longitude: -8.8679 },
       
//         { name: "PSA Genoa Pra’ (Italy)", latitude: 44.4328, longitude: 8.8394 },
       
//     ];

//     const avoidZones = ['panama canal']; // Example avoid zones
//     const startPoint = [53.5330, 9.9656]; // Example starting point (Singapore)

//     const result = await getWaypointsAndPortOrder(portOrder, avoidZones, startPoint);

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
