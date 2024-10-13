const express = require('express');
const { fetchAllByPortAppointmentData } = require('../firebase/firebaseMethods');

const router = express.Router();

// POST request to suggest a reroute for vessels
router.post('/', async (req, res) => {
  const { portName } = req.body;
  // Logic to handle reroute recommendation
  const appointments = await fetchAllByPortAppointmentData(portName);
  console.log(appointments);
  res.json(appointments);
});

module.exports = router;
