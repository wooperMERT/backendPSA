const express = require('express');
const { getWaypointsAndPortOrder } = require('../service/seaDistanceService');

const router = express.Router();

// POST request to suggest a reroute for vessels
router.post('/reroute', async (req, res) => {
    const { startCoordinates, endCoordinates, avoidZones } = req.body;
  // Logic to handle reroute recommendation
    const response = await getWaypointsAndPortOrder(startCoordinates, endCoordinates, avoidZones);
    console.log(response);
    res.json(response);
});
/* response will be totalNewDistance,
    portOrder: newPortOrder,  // Returning the reordered port order
    waypointsPerLeg,  // Returning an array of waypoints for each leg
    allWaypoints,  // Returning the combined waypoints
*/

module.exports = router;