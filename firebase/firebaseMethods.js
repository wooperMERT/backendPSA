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

// NEWS RELATED //////////////////////////////////////
const addNewsData = async (crisisData) => {
  try {
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

const fetchAllNewsData = async () => {
  try {
    const querySnapshot = await db.collection('crises').get();
    const crises = querySnapshot.docs.map(doc => doc.data());
    return crises;
  } catch (error) {
    console.error('Error fetching documents: ', error);
    return [];
  }
};

// VESSEL RELATED //////////////////////////////////////
const fetchSpecificVesselData = async (shipName) => {
  try {

  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

const fetchAllVesselData = async () => {
  try {
    
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

const updateSpecificVesselData = async (vessel) => {
  try {
    
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

// RECORD RELATED //////////////////////////////////////
const fetchSpecificRecordData = async (shipName, newsTitle) => {
  try {

  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

const fetchAllByNewsRecordData = async (newsTitle) => {
  try {
    
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

const addRecordData = async (record) => {
  try {
    
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

// APPOINTMENT RELATED //////////////////////////////////////
const fetchSpecificAppointmentData = async (shipName, portName) => {
  try {

  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

const fetchAllByPortAppointmentData = async (portName) => {
  try {
    
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

const updateSpecificAppointmentData = async (appointment) => {
  try {
    
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

const addAppointmentData = async (appointment) => {
  try {
    
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

// Export the functions for use in other files
module.exports = {fetchSpecificVesselData, fetchAllVesselData, updateSpecificVesselData, addRecordData, fetchSpecificRecordData, fetchAllByNewsRecordData, addNewsData, fetchAllNewsData, fetchAllByPortAppointmentData, fetchSpecificAppointmentData, updateSpecificAppointmentData, addAppointmentData}
