const express = require('express');
const router = express.Router();
const {fetchAllNewsData, updateNewsAccept, fetchNewsState} = require('../firebase/firebaseMethods');

// POST request to suggest a reroute for vessels
router.get('/', async (req, res) => {
  const response = await fetchAllNewsData();
  res.json(response);
});

router.post('/updateAccept', async (req, res) => {
  const { title, accepted } = req.body;
  // Logic to handle reroute recommendation

  console.log("hi");
  const news = await updateNewsAccept(title, accepted);
  res.json(news);
})

router.post('/fetchState', async (req, res) => {
  const {title} = req.body;
  const accepted = await fetchNewsState(title);
  res.json(accepted)
})

module.exports = router;