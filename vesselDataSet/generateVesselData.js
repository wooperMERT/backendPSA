const { faker } = require('@faker-js/faker');
const { psaPortsCoordinates } = require('./ports');
const {saveVesselData} = require("../firebase/firebaseMethods")

// Helper function to generate random routes through a series of ports
function generateRoute(ports, steps = 24) {
    const route = [];
    
    // Loop through each port to create route segments
    for (let i = 0; i < ports.length - 1; i++) {
        const start = ports[i];
        const end = ports[i + 1];
        
        const latStep = (end.latitude - start.latitude) / steps;
        const lonStep = (end.longitude - start.longitude) / steps;

        for (let j = 0; j <= steps; j++) {
            route.push({
                latitude: start.latitude + latStep * j,
                longitude: start.longitude + lonStep * j
            });
        }
    }
    
    return route;
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

// Haversine formula to calculate distance between two lat/lon points
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Generate 100 vessels data
const vesselData = Array.from({ length: 100 }, () => {
    const portStopsCount = Math.floor(Math.random() * 5) + 2; // Randomize the number of ports (2 to 6)
    const portStops = getRandomPorts(portStopsCount); // Get random ports
    const etas = generateETAs(portStops); // Generate ETAs for each port

    // Add the ETA attribute to each port
    const portStopsWithETA = portStops.map((port, index) => ({
        ...port,
        estimatedTimeOfArrival: etas[index],
    }));

    return {
        portStops: portStopsWithETA,
        routes: generateRoute(portStops),
        info: {
            MMSI: Math.floor(Math.random() * (999999999 - 200000000 + 1)) + 200000000,
            ShipName: faker.company.name(),
        },
    };
});

/*console.log(vesselData[1]);
console.log(vesselData[1].routes[1]);
console.log(vesselData[1].portStops[1]);*/

saveVesselData(vesselData[1]);

module.exports =  {vesselData}