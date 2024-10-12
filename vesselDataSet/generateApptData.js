const {fetchAllVesselData} = require('../firebase/firebaseMethods')
const { faker } = require('@faker-js/faker');
const { db } = require('../firebase/firebaseMethods');
const { psaPortsCoordinates } = require('./ports');


async function generateAppointments() {
    const appointments = [];

    const vessel = await fetchAllVesselData();
     // Ensure vessels is an array before using .forEach
     if (Array.isArray(vessel)) {
        vessel.forEach(vessel => {
            vessel.portStops.forEach((port, index) => {
                appointments.push({
                    shipName: vessel.info.ShipName, // Assuming the vessel array has a 'name' field
                    shipID: vessel.info.MMSI, // Assuming the vessel array has an 'id' field
                    dateTime: port.estimatedTimeOfArrival,
                    portName: port.name,
                    berthNo: (index % 10) + 1 // Spreading the berthNo from 1 to 10
                });
            });
        });
    } else {
        console.error("The fetched vessel data is not an array.");
    }

    return appointments;
}

async function saveAppointmentsToFirestore() {
    try {
        const appointments = await generateAppointments();
        
        // Loop through each appointment and add it to Firestore
        const batch = db.batch(); // Use a batch for better performance
        appointments.forEach(appointment => {
            const appointmentRef = db.collection('appointment').doc(); // Automatically generate a document ID
            batch.set(appointmentRef, appointment);
        });
        
        // Commit the batch
        await batch.commit();
        console.log('All appointments have been saved to Firestore.');
    } catch (error) {
        console.error('Error saving appointments to Firestore:', error);
    }
}

saveAppointmentsToFirestore();