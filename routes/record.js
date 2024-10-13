const express = require('express');
const { fetchSpecificRecordData } = require('../firebase/firebaseMethods');

const router = express.Router();

// POST request to suggest a reroute for vessels
router.post('/', async (req, res) => {
  const { newsTitle } = req.body;
  // Logic to handle reroute recommendation
  const records = await fetchSpecificRecordData(newsTitle);
  console.log(records);
  res.json(records);
});

module.exports = router;
