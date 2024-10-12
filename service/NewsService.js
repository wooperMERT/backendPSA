const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://newsapi.org/v2/everything'; // Base URL for the API
const NEWS_API_KEY = ""; // Your API key
const OPENAI_API_KEY = "";

const baseQuery = 'You are a manager for a shipping company. You will be provided with the following news content and judge whether does the event is significant enough to close down a sea route for your ship. Map out a square area to showcase the affected area. Only reply me one of these 2 answers. Reply me "signficiant-%area%-%latitude1%-%longitude1%-%latitude2%-%longitude2%" if it is significant, where %area% is the name of the affected area, where %longitude1% and %latitude1% are the coordinates to represent the top left corner of the affected square, where %longitude2% and %latitude2% are the coordinates to represent the bottom right corner of the affected square. Reply me "insigificant" if it is not significant.'
// Function to fetch news for a specific date and category
const fetchNewsByDateRangeAndCategory = async (startDateTime, endDateTime, category) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                q: category,                // Query for category
                from: startDateTime,        // Start date and time (YYYY-MM-DDTHH:MM:SSZ)
                to: endDateTime,            // End date and time (YYYY-MM-DDTHH:MM:SSZ)
                apiKey: NEWS_API_KEY,       // Your API key
                sortBy: 'publishedAt',      // Sort by publish date
            },
        });
        return response.data.articles; // Return the articles
    } catch (error) {
        console.error('Error fetching news:', error.message);
        throw error; // Rethrow or handle the error as needed
    }
};

const fetchArticleContent = async (url) => {
    try {
        // Fetch the HTML of the article page
        const { data } = await axios.get(url);

        // Load the HTML into Cheerio
        const $ = cheerio.load(data);

        // Extract the relevant information
        const title = $('h1').text(); // Adjust the selector based on the website's structure
        const publicationDate = $('time').attr('datetime'); // Adjust the selector
        const author = $('.author-name').text(); // Adjust the selector
        const content = $('.article-body, .content, .entry-content, .paragraph').text().trim(); // Adjust the selector for the main content

        return {
            title,
            publicationDate,
            author,
            content,
        };
    } catch (error) {
        console.error('Error fetching article content:', error.message);
    }
};

const queryOpenAI = async (content) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo', // You can choose the model you want to use
                messages: [
                    {
                        role: 'user',
                        content: baseQuery + content,
                    },
                ],
                temperature: 0.7, // Adjust as needed
                max_tokens: 100, // Limit the response length
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const reply = response.data.choices[0].message.content; // Extract the response text
        return reply;
    } catch (error) {
        console.error('Error communicating with OpenAI:', error.message);
        throw error; // Rethrow or handle the error as needed
    }
};

const runProcess = async () => {
    const articles = await fetchNewsByDateRangeAndCategory("2024-10-10T00:00:00Z", "2024-11-10T23:59:59Z","weather");
    const articleContent = await fetchArticleContent(articles[0].url);
    const responseMessage = await queryOpenAI(articleContent.content);
    console.log(articles[0].title);
    console.log(articles[0].url);
    console.log("-----------");
    console.log(articleContent.content);
    console.log("-----------");
    console.log(responseMessage);
};

// Call the function with the article URL
//runProcess("https://edition.cnn.com/2024/06/20/business/red-sea-vessel-sunk-shipping-warning/index.html");
runProcess();
