// Import necessary Firebase Admin SDK modules
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wooper-f2100.firebaseio.com" // Replace with your actual database URL if you're using Realtime Database
});

// Initialize Firestore
const db = admin.firestore();

// Firestore Write (Add Data)
const storeCrisisData = async (crisisData) => {
  try {
    // Log the data you're about to send to Firestore
    console.log("Crisis Data:", crisisData);
    
    // Ensure no undefined or invalid values in the data
    if (!crisisData || !crisisData.title || !crisisData.area || typeof crisisData.delayInHours !== 'number') {
      throw new Error("Invalid data structure");
    }

    const docRef = await db.collection('crises').add(crisisData);
    console.log('Document written with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

// Firestore Read (Get Data)
const fetchCrisesData = async () => {
  try {
    const querySnapshot = await db.collection('crises').get();
    const crises = querySnapshot.docs.map(doc => doc.data());
    return crises;
  } catch (error) {
    console.error('Error fetching documents: ', error);
    return [];
  }
};

// Export the functions for use in other files
module.exports = { storeCrisisData, fetchCrisesData };

// Example usage
const crisisDataExample = {
  title: 'Hurricane Example',
  description: 'Hurricane event in Florida.',
  significant: true,
  area: 'Florida',
  delayInHours: 12,
  latitude1: 30.00,
  longitude1: -87.63,
  latitude2: 40.00,
  longitude2: -80.00,
  publishedAt: new Date(),
  accepted: false
};

// Call the storeCrisisData function to add a crisis
storeCrisisData(crisisDataExample);
