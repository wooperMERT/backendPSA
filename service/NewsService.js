const axios = require('axios');
const APIkeys = require('../APIkeys.json');

const { addNewsData } = require('../firebase/firebaseMethods');

const BASE_URL = 'https://newsapi.org/v2/everything'; // Base URL for the API
const NEWS_API_KEY = APIkeys.NEWS_API_KEY;
const OPENAI_API_KEY = APIkeys.OPENAI_API_KEY;


const baseQuery = 'You are a manager for a shipping company. You will be provided with the following news content and judge whether does the event is significant enough to close down a sea route for your ship. Map out a square area to showcase the affected area. Only reply me one of these 2 answers. Reply me "signficiant-%area%-%latitude1%-%longitude1%-%latitude2%-%longitude2%-%strait%" if it is significant, where %strait% is the strait where the event is happening (or the closest strait), where %area% is the name of the affected area, where %longitude1% and %latitude1% are the coordinates to represent the top left corner of the affected square, where %longitude2% and %latitude2% are the coordinates to represent the bottom right corner of the affected square. Reply me "insigificant" if it is not significant.'
const category = 'weather';

// Function to fetch news for a specific date and category
const fetchNewsByDateRangeAndCategory = async (startDateTime, endDateTime) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                q: category,                // Query for category
                from: startDateTime,        // Start date and time (YYYY-MM-DDTHH:MM:SSZ)
                to: endDateTime,            // End date and time (YYYY-MM-DDTHH:MM:SSZ)
                apiKey: NEWS_API_KEY,       // Your API key
                sortBy: 'publishedAt',      // Sort by publish date
            },
            timeout: 5000,
        });
        return response.data.articles; // Return the articles
    } catch (error) {
        //console.error('Error fetching news:', error.message);
        throw error; // Rethrow or handle the error as needed
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

const queryMultipleOpenAI = async (articles) => {
    const updatedArticles = await Promise.all(
        articles.map(async (article) => {
            const response = await queryOpenAI(article.content);
            if (!response.startsWith("significant")) {
                return {
                    ...article,
                    significant: false,
                }
            }
            const items = response.split("-");
            return {
                ...article,
                significant: true,
                area: items[1],
                latitude1: items[2],
                longitude1: items[3],
                latitude2: items[4],
                longitude2: items[5],
                strait: items[6],
                accepted: false,
            };
        })
    );
    return updatedArticles.filter(article => article.significant);
}

const getSignificantAndNewArticles = async (timeIn, timeOut) => {
    const articles = await fetchNewsByDateRangeAndCategory(timeIn, timeOut);
    if (!articles) { return; }
    const articlesFinal = await queryMultipleOpenAI(articles);
    if (!articlesFinal) { return; }
    return articlesFinal;
};

const updateNewsData = async (currentDateTime) => {
    const startString = currentDateTime.toISOString().split('.')[0] + 'Z';
    const endDateTime = new Date(currentDateTime);
    const endString = endDateTime.toISOString().split('.')[0] + 'Z';
    const articles = await getSignificantAndNewArticles(startString, endString);
    articles.forEach(element => {
        addNewsData(element);
    });
}

module.exports = { getSignificantAndNewArticles, updateNewsData };
//runProcess("2024-10-10T00:00:00Z", "2024-11-10T23:59:59Z", "weather");
