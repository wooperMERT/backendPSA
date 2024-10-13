const express = require('express');
const router = express.Router();
const {fetchAllNewsData} = require('../firebase/firebaseMethods');

// POST request to suggest a reroute for vessels
router.get('/', async (req, res) => {
  const response = await fetchAllNewsData();
  res.json(response);
});

module.exports = router;