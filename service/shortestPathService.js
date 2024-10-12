// dijkstra.js

// Dijkstra's Algorithm to find the shortest path from the start city
// with consideration of both travel times (edges) and wait times (node weights)
const dijkstraWithWaitTimes = (startCity, adjList, waitTimes) => {
    const n = adjList.length; // Number of cities
    const distances = Array(n).fill(Infinity); // Initialize distances to Infinity
    distances[startCity] = 0; // Distance to start city is 0
    const previousCity = Array(n).fill(null); // To store the previous city in the shortest path

    // Priority queue implemented using a min-heap
    const priorityQueue = [[0, startCity]]; // [current_time, city]

    while (priorityQueue.length > 0) {
        // Sort to act like a priority queue (heap), pick the smallest time
        priorityQueue.sort((a, b) => a[0] - b[0]);
        const [currentTime, city] = priorityQueue.shift(); // Extract the city with the smallest time

        // If the current city's time is larger than the recorded shortest time, skip
        if (currentTime > distances[city]) continue;

        // Explore neighbors (adjacent cities)
        for (let [neighbor, travelTime] of adjList[city]) {
            const newTime = currentTime + travelTime + waitTimes[neighbor]; // Add travel time + wait time at neighbor

            // If the new computed time is less than the recorded time, update it
            if (newTime < distances[neighbor]) {
                distances[neighbor] = newTime;
                previousCity[neighbor] = city; // Update the path
                priorityQueue.push([newTime, neighbor]); // Push the neighbor to the queue
            }
        }
    }

    return { distances, previousCity };
};

// Function to reconstruct the path from the start city to a target city
const reconstructPath = (previousCity, targetCity) => {
    const path = [];
    let currentCity = targetCity;
    while (currentCity !== null) {
        path.push(currentCity);
        currentCity = previousCity[currentCity];
    }
    return path.reverse(); // Reverse to get the path from start to target
};

// Export the functions using CommonJS
module.exports = {
    dijkstraWithWaitTimes,
    reconstructPath,
};