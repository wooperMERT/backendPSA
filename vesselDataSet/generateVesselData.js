const { faker } = require('@faker-js/faker');
const { psaPortsCoordinates } = require('./ports');
const { db, saveVesselData, fetchAllVesselData, fetchSpecificVesselDataID, fetchAllAvoidZoneData } = require('../firebase/firebaseMethods');

// Function to generate vessel route by calculating straight-line waypoints between ports
async function generateVesselRoute(vesselId) {
    try {
        const vesselData = await fetchSpecificVesselDataID(vesselId); // Fetch vessel data
        const startPoint = vesselData.portStops[0]; // Assuming the first port as the starting point
        const route = calculateLinearRoute(vesselData.portStops);

        console.log(route);

        const truncatedRoute = [];
        const steps = 10; // Number of steps between waypoints

        // Truncate the waypoints every 'steps' to simulate distance reduction
        for (let i = 0; i < route.length; i += steps) {
            truncatedRoute.push(route[i]);
        }

        return truncatedRoute;
    } catch (error) {
        console.error('Error generating vessel route:', error);
    }
}

// Function to calculate straight-line waypoints between ports
function calculateLinearRoute(portStops) {
    const allWaypoints = [];

    for (let i = 0; i < portStops.length - 1; i++) {
        const start = portStops[i];
        const end = portStops[i + 1];
        const distance = getDistanceFromLatLonInKm(start.latitude, start.longitude, end.latitude, end.longitude);
        const waypoints = generateWaypointsBetween(start, end, distance);
        allWaypoints.push(...waypoints); // Add waypoints between ports
    }

    return allWaypoints;
}

// Function to generate waypoints between two ports based on straight-line distance
function generateWaypointsBetween(start, end, distance) {
    const numWaypoints = Math.floor(distance / 20); // Assuming 20 km between waypoints
    const waypoints = [];

    for (let i = 0; i <= numWaypoints; i++) {
        const ratio = i / numWaypoints;
        const lat = start.latitude + ratio * (end.latitude - start.latitude);
        const lon = start.longitude + ratio * (end.longitude - start.longitude);
        waypoints.push({ latitude: lat, longitude: lon });
    }

    return waypoints;
}

// Function to calculate distance between two lat/lon points using the Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Helper function to generate random estimated times of arrival for each port
function generateETAs(portStops, averageSpeed = 30) { // averageSpeed in nautical miles per hour
    const etas = [];
    let currentTime = Date.now(); // Use current time as the starting point

    for (let i = 0; i < portStops.length; i++) {
        if (i > 0) {
            // Calculate the distance between the current and previous port
            const prevPort = portStops[i - 1];
            const currentPort = portStops[i];
            const distance = getDistanceFromLatLonInKm(
                prevPort.latitude,
                prevPort.longitude,
                currentPort.latitude,
                currentPort.longitude
            ) * 0.539957; // Convert km to nautical miles

            // Calculate time to travel this distance
            const travelTime = (distance / averageSpeed) * 3600 * 1000; // Time in milliseconds
            currentTime += travelTime;
        }

        // Push the ETA as a new attribute
        etas.push(new Date(currentTime).toISOString());
    }

    return etas;
}

// Function to generate a random number of unique ports
function getRandomPorts(num) {
    const uniquePorts = new Set();
    while (uniquePorts.size < num) {
        const randomPort = psaPortsCoordinates[Math.floor(Math.random() * psaPortsCoordinates.length)];
        uniquePorts.add(randomPort);
    }
    return Array.from(uniquePorts);
}

// Generate 100 vessels data
const vesselData = Array.from({ length: 2 }, () => {
    const portStopsCount = 3; // Randomize the number of ports (2 to 6)
    const portStops = getRandomPorts(portStopsCount); // Get random ports
    const etas = generateETAs(portStops); // Generate ETAs for each port

    // Add the ETA attribute to each port
    const portStopsWithETA = portStops.map((port, index) => ({
        ...port,
        estimatedTimeOfArrival: etas[index],
    }));

    return {
        portStops: portStopsWithETA,
        routes: [29.5312, 35.0063],
        info: {
            MMSI: Math.floor(Math.random() * (999999999 - 200000000 + 1)) + 200000000,
            ShipName: faker.company.name(),
        },
    };
});

// Function to fetch vessel information and generate a route
async function fetchVesselInfo() {
    const allVessels = await fetchAllVesselData(); // Make sure to await if it's an async function
    console.log("Fetched Vessel Data:", allVessels);

    if (allVessels && allVessels.length > 0) {
        console.log(allVessels[0].info.MMSI); // Access MMSI from the first vessel
        const truncatedRoute = await generateVesselRoute(allVessels[0].info.MMSI); // Generate route
        console.log("Truncated Route: ", truncatedRoute); // Log the truncated route
    } else {
        console.error("No vessel data available.");
    }
}

fetchVesselInfo();

module.exports = { vesselData };
