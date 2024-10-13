const { faker } = require('@faker-js/faker');
const { psaPortsCoordinates } = require('./ports');
const {saveVesselData} = require("../firebase/firebaseMethods")
const { db } = require('../firebase/firebaseMethods');
const { getWayPointsAndPortOrder } = require('../ports/service/seaDistanceService');

// Function to fetch vessel data from Firestore
async function getVesselData(vesselId) {
    try {
        const vesselDoc = await db.collection('vesselData').doc(vesselId).get();
        if (!vesselDoc.exists) {
            throw new Error('Vessel data not found');
        }
        return vesselDoc.data();
    } catch (error) {
        console.error('Error fetching vessel data:', error);
    }
}

// Function to fetch news data for avoid zones
async function getAvoidZones() {
    try {
        const newsCollection = await db.collection('news').get();
        const avoidZones = [];
        
        newsCollection.forEach(doc => {
            const data = doc.data();
            if (data.avoidZones && data.avoidZones.length > 0) {
                avoidZones.push(...data.avoidZones);
            }
        });

        return avoidZones;
    } catch (error) {
        console.error('Error fetching avoid zones:', error);
    }
}

async function generateVesselRoute(vesselId) {
    try {
        const vesselData = await getVesselData(vesselId); // Fetch vessel data
        const avoidZones = await getAvoidZones(); // Fetch avoid zones
        const startPoint = vesselData.portStops[0]; // Assuming first port as the starting point
        
        // Now, use the data to generate the route
        const details = getWayPointsAndPortOrder(vesselData.portStops, avoidZones, [startPoint.latitude, startPoint.longitude]);
        const route = details.allWaypoints;

        const truncatedRoute = [];
        const steps = 10;

        // Truncate the waypoints every 10 steps (as 20km)
        for (let i = 0; i < route.length; i += steps) {
            truncatedRoute.push(route[i]);
        }

        return truncatedRoute;
    } catch (error) {
        console.error('Error generating vessel route:', error);
    }
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
        routes: generateVesselRoute(portStops),
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