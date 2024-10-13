const {fetchAllVesselData, updateSpecificVesselData} = require('../firebase/firebaseMethods.js');

const updateVesselData = async () => {
    try {
        const allVessels = await fetchAllVesselData(); // Fetch all vessel data
        
        // Loop through each vessel and update its data
        for (const vessel of allVessels) {
            // Assuming the vessel object has an info property with MMSI
            const vesselId = vessel.info.MMSI; // Extract the MMSI or unique identifier
            
            await updateSpecificVesselData(vesselId); // Call the update function
        }
        
        console.log('All vessel data updated successfully!');
    } catch (error) {
        console.error('Error updating vessel data: ', error.message);
    }
}

module.exports = {updateVesselData}