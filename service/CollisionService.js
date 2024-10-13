// isShipPathInDangerousSquare.js
const {fetchSpecificVesselDataID} = require('../firebase/firebaseMethods')

function isPointInSquare(lat, lon, square) {
    const { topLeft, bottomRight } = square;

    return (
        lat >= topLeft.lat &&
        lat <= bottomRight.lat &&
        lon >= topLeft.lon &&
        lon <= bottomRight.lon
    );
}

function doLinesIntersect(p1, p2, p3, p4) {
    const orientation = (p, q, r) => {
        const val = (q.lon - p.lon) * (r.lat - p.lat) - (q.lat - p.lat) * (r.lon - p.lon);
        if (val === 0) return 0; // Collinear
        return (val > 0) ? 1 : 2; // Clockwise or counter-clockwise
    };

    const onSegment = (p, q, r) => {
        return (q.lon <= Math.max(p.lon, r.lon) && q.lon >= Math.min(p.lon, r.lon) &&
                q.lat <= Math.max(p.lat, r.lat) && q.lat >= Math.min(p.lat, r.lat));
    };

    const o1 = orientation(p1, p2, p3);
    const o2 = orientation(p1, p2, p4);
    const o3 = orientation(p3, p4, p1);
    const o4 = orientation(p3, p4, p2);

    if (o1 !== o2 && o3 !== o4) return true; // General case

    if (o1 === 0 && onSegment(p1, p3, p2)) return true; // p1, p2 and p3 are collinear
    if (o2 === 0 && onSegment(p1, p4, p2)) return true; // p1, p2 and p4 are collinear
    if (o3 === 0 && onSegment(p3, p1, p4)) return true; // p3, p4 and p1 are collinear
    if (o4 === 0 && onSegment(p3, p2, p4)) return true; // p3, p4 and p2 are collinear

    return false; // Doesn't intersect
}

function isShipPathInDangerousSquare(shipPath, square) {
    const [start, end] = shipPath;

    // Check if either endpoint is within the square
    if (isPointInSquare(start.lat, start.lon, square) || isPointInSquare(end.lat, end.lon, square)) {
        return true;
    }

    // Check if the path intersects the square's edges
    const squareEdges = [
        [{ lat: square.topLeft.lat, lon: square.topLeft.lon }, { lat: square.topLeft.lat, lon: square.bottomRight.lon }], // Top Edge
        [{ lat: square.topLeft.lat, lon: square.bottomRight.lon }, { lat: square.bottomRight.lat, lon: square.bottomRight.lon }], // Right Edge
        [{ lat: square.bottomRight.lat, lon: square.bottomRight.lon }, { lat: square.bottomRight.lat, lon: square.topLeft.lon }], // Bottom Edge
        [{ lat: square.bottomRight.lat, lon: square.topLeft.lon }, { lat: square.topLeft.lat, lon: square.topLeft.lon }] // Left Edge
    ];

    for (let edge of squareEdges) {
        if (doLinesIntersect(start, end, edge[0], edge[1])) {
            return true; // Path intersects with square edge
        }
    }

    return false; // Path does not intersect with the square
}

async function isShipAffected(vesselId, news) {
    const square = {
        topLeft: {lat: news.latitude1, lon: news.longitude1},
        bottomRight: {lat: news.latitude2, lon: news.longitude2}
    }

    const vesselData = await fetchSpecificVesselDataID(vesselId);
    // Iterate over the routes in vesselData
    for (let i = 0; i < vesselData.routes.length - 1; i++) {
        // Get the current point and the next point
        const start = vesselData.routes[i];
        const end = vesselData.routes[i + 1];
        
        // Check if the ship path is in the dangerous square
        if (isShipPathInDangerousSquare([start, end], square)) {
            return true; // Return true if any segment is in danger
        }
    }

    return false;
}

// Example usage
const dangerousSquare = {
    topLeft: { lat: 20, lon: 30 },
    bottomRight: { lat: 25, lon: 35 },
};

const shipPath = [
    { lat: 21, lon: 31 }, // Start point of the ship
    { lat: 24, lon: 34 }, // End point of the ship
];

const result = isShipPathInDangerousSquare(shipPath, dangerousSquare);
console.log(result ? "Ship path enters the dangerous square." : "Ship path is safe.");

module.exports = {
    isShipPathInDangerousSquare,
    isShipAffected
};
