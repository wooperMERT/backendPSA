const express = require('express');
const { fetchAllVesselData, fetchSpecificVesselDataID, fetchSpecificVesselDataName } = require('../firebase/firebaseMethods');

const router = express.Router();

// POST request to fetch all vessels
router.post('/all', async (req, res) => {
  const data = await fetchAllVesselData();
  //console.log(data);
  res.json(data);
});

// POST req to fetch specific vessel using mmsi (shipID)
router.post('/id', async (req, res) => {
  const { shipId } = req.body;
  // Logic to handle reroute recommendation
  const data = await fetchSpecificVesselDataID(shipId);
  res.json(data);
});

// POST req to fetch specific vessel using shipname
router.post('/name', async (req, res) => {
  try {
    const { shipName } = req.body;
    // Fetch the specific vessel data based on the ship name
    const data = await fetchSpecificVesselDataName(shipName);

    if (!data) {
      // If no data is found, send an error message
      res.status(404).json({ error: 'Vessel not found' });
    } else {
      // Send the retrieved data back as JSON
      res.json(data);
    }
  } catch (error) {
    console.error('Error fetching vessel data:', error);
    // Send a 500 status code with an error message
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;
