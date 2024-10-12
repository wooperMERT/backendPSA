const express = require('express');
const axios = require('axios');
const app = express();

// Middleware to parse incoming JSON
app.use(express.json());

// Basic route for health check
app.get('/', (req, res) => {
  res.send('Maritime Port Management API is running.');
});

// Route to handle reroute suggestions
app.post('/api/reroute', async (req, res) => {
  const { shipId, currentRoute } = req.body;

  try {
    // Fetching external data (simulating news or weather impact)
    const newsResponse = await axios.get('https://newsapi.org/v2/everything?q=port&apiKey=YOUR_NEWS_API_KEY');
    const articles = newsResponse.data.articles;
    
    let rerouteNeeded = false;
    articles.forEach(article => {
      if (article.title.includes('port congestion') || article.description.includes('strike')) {
        rerouteNeeded = true;
      }
    });

    const newRoute = rerouteNeeded ? `Alternative Route for Ship ${shipId}` : currentRoute;

    res.json({ 
      message: `Reroute suggestion for Ship ${shipId}`, 
      newRoute: newRoute 
    });

  } catch (error) {
    console.error('Error fetching news data:', error);
    res.status(500).json({ message: 'Failed to retrieve reroute suggestion' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});