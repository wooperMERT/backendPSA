import express from 'express';
import { fetchSpecificRecordData } from '../firebase/firebaseMethods';

const router = express.Router();

// POST request to suggest a reroute for vessels
router.post('/', (req, res) => {
  const { newsTitle } = req.body;
  // Logic to handle reroute recommendation
  const records = fetchSpecificRecordData(newsTitle);
  res.json(records);
});

export default router;
