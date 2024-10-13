const { faker } = require('@faker-js/faker');
const { psaPortsCoordinates } = require('./ports');
const { db, saveVesselData, fetchAllVesselData, fetchSpecificVesselDataID, fetchAvoidZonesFromNews } = require('../firebase/firebaseMethods');
const { tsp } = require('../service/shortestPathService');
const { getWayPointsAndPortOrder } = require('../service/seaDistanceService');


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


/*console.log(vesselData[1]);
console.log(vesselData[1].routes[1]);
console.log(vesselData[1].portStops[1]);*/

// Function to save vessel data to Firestore
// async function saveVesselData(vessel) {
//     try {
//         const docRef = db.collection("vesselData").doc(`vessel_${vessel.info.MMSI}`); // Create document reference
//         await docRef.set(vessel);
//         console.log("Document written with ID: ", docRef.id);
//     } catch (error) {
//         console.error("Error adding document: ", error);
//     }
// }

// for(i = 0 ; i < vesselData.length; i++){
//     // console.log(vesselData[i]);
//     saveVesselData(vesselData[i]);
// }
// async function fetchVesselInfo() {
//     const allVessels = await fetchAllVesselData(); // Make sure to await if it's an async function
//     console.log("Fetched Vessel Data:", allVessels);

//     if (allVessels && allVessels.length > 0) {
//         console.log(allVessels[0].info.MMSI); // Access MMSI from first vessel
//     } else {
//         console.error("No vessel data available.");
//     }
//     generateVesselRoute(allVessels[0].info.MMSI);
// }
// fetchVesselInfo();
// Test the function
generateVesselRoute("345934147"); // Example vessel ID from Firebase



module.exports =  { generateVesselRoute };