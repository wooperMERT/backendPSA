const {fetchAllVesselData} = require('../firebase/firebaseMethods');
const { db } = require('../firebase/firebaseMethods');

// Async function to fetch and log vessel data
const getPortStops = async () => {
    const vesselList = await fetchAllVesselData();
    const isolate = vesselList.map((vessel) => vessel.portStops);
    console.log(isolate); // Now you can log the resolved value of vesselList
    return isolate;
};

async function saveRecordData(portStops) {
    try {
        const docRef = db.collection("record").doc();
    
        const prePortOrder = {
            prePortOrder: portStops[1],
            postPortOrder: portStops[1]
        }
        await docRef.set(prePortOrder);
        console.log("Document written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
};

const main = async () => {
    try {
        const portStops = await getPortStops();  // Fetch portStops
        if (portStops && portStops.length > 0) {  // Check if portStops data is available
            await saveRecordData(portStops);  // Save the portStops data to Firestore
        } else {
            console.log("No portStops available to save.");  // Log if no portStops are available
        }
    } catch (error) {
        console.error("Error in fetching or saving portStops: ", error);  // Error handling for the main process
    }
};

// Execute the main function
main();

console.log(saveRecordData[0]);

