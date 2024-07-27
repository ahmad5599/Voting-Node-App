const mongoose = require('mongoose');
require('dotenv').config(); //must add this line to use .env file

// MongoDB URL
const mongoUrl = 'mongodb://localhost:27017/voting-app';
// const mongoUrl = 'mongodb+srv://admin:admin123@hotels.hno7nb8.mongodb.net/?retryWrites=true&w=majority&appName=Hotels'
// const mongoUrl = process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/hotels';

// Connect to MongoDB
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection
const db = mongoose.connection;

// Event listeners for db connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('connected', () => {
  console.log('Connected to MongoDB');
});
db.once('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

module.exports = db;
