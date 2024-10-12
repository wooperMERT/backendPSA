// Import necessary Firebase modules
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs } = require("firebase/firestore");
require("dotenv").config();  // Loads the environment variables from the .env file

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: "",
  authDomain: "wooper-f2100.firebaseapp.com",
  projectId: "wooper-f2100",
  storageBucket: "wooper-f2100.appspot.com",
  messagingSenderId: "455583231154",
  appId: "1:455583231154:web:67d90a1f1640bd78aeedab",
  measurementId: "G-NQ7HP5FPYF"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore Write (Add Data)
const storeCrisisData = async (crisisData) => {
  try {
    // Log the data you're about to send to Firestore
    console.log("Crisis Data:", crisisData);
    
    // Ensure no undefined or invalid values in the data
    if (!crisisData || !crisisData.title || !crisisData.area || typeof crisisData.delayInHours !== 'number') {
      throw new Error("Invalid data structure");
    }
    
    const docRef = await addDoc(collection(db, 'crises'), crisisData);
    console.log('Document written with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

// Firestore Read (Get Data)
const fetchCrisesData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'crises'));
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
  longtitude2: -80.00,
  publishedAt: new Date(),
};

// Call the storeCrisisData function to add a crisis
storeCrisisData(crisisDataExample);
