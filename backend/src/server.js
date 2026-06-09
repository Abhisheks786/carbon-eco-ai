require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin Setup
const fs = require('fs');
const path = require('path');
let firebaseInitialized = false;
const serviceAccountPath = path.join(__dirname, '../carbon-eco-firebase-adminsdk-fbsvc-d5be3b1802.json');

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log("Firebase Admin successfully initialized from JSON file.");
  } catch (e) {
    console.warn("Failed to initialize Firebase from JSON file, trying environment variable...", e.message);
  }
}

if (!firebaseInitialized && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
    firebaseInitialized = true;
    console.log("Firebase Admin successfully initialized from env variable.");
  } catch (e) {
    console.warn("Firebase config env variable invalid, running in mock mode");
  }
}

if (!firebaseInitialized) {
  console.warn("No firebase credentials found, running in mock mode");
}

// Routes
const authRoutes = require('./routes/authRoutes');
const footprintRoutes = require('./routes/footprintRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const communityRoutes = require('./routes/communityRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/footprint', footprintRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/community', communityRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`EcoTrack AI Backend (Refactored) running on port ${PORT}`);
});

module.exports = app;
