// Dependencies
const dotenv = require('dotenv');
const express = require('express');
const axios = require('axios');
const app = express();
const WebSocket = require('ws');
const cors = require('cors');

const { updateNewsData } = require('./service/NewsService');
const { updateAppointments } = require('./firebase/firebaseMethods');
// routers
const recordRouter = require('./routes/record');

const appointmentRouter = require('./routes/appointment');
const vesselRouter = require('./routes/vessel')
const newsRouter = require('./routes/news');

// Time
const currentDateTime = new Date('2024-10-13T10:30:00Z');
const increaseTime = () => { currentDateTime.setHours(currentDateTime.getHours() + 1); };



// Middleware
app.use(express.json()); // Parse incoming JSON
dotenv.config(); // Load .env into environment variables
app.use(cors());

// Time Increase
app.post('/', async (req, res) => {
    timeStepOver();
    broadcastMessage();
    res.json("hi");
});



// Route
app.use('/api/record', recordRouter);

app.use('/api/appointment', appointmentRouter);

app.use('/api/vessel', vesselRouter);
app.use('/api/news', newsRouter);


// Start the HTTP server on PORT 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// WebSocket server on a different port (3002)
const WEBSOCKET_PORT = process.env.WS_PORT || 3002;
const wss = new WebSocket.Server({ port: WEBSOCKET_PORT });

let clients = [];

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.push(ws);

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log('Client disconnected');
    });
});

const broadcastMessage = () => {
    const message = JSON.stringify({ message: 'Hello from the server', timestamp: currentDateTime });
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

// API route for sea distance
app.use('/api/seaDistance', async (req, res) => {
    try {
        const result = await getWaypointsAndPortOrder(req.body); // Assume you're passing required body
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

setInterval(broadcastMessage, 5000);

console.log(`WebSocket server started on ws://localhost:${WEBSOCKET_PORT}`);

const timeStepOver = async () => {
    //updateVesselData(); //update vessel moving
    //updateNewsData(); //receive new News and add to database
    //updateAppointments(currentDateTime); //update appointments that occured
    increaseTime(); //increase time variable - DONE
}
