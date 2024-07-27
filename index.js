const express = require("express");
const app = express();

const db = require("./db"); // Ensure this file exists and is correctly configured


// Middleware
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// Home route
app.get("/", (req, res) => {
  res.send("Hello, welcome to our Hotel!");
});

//routes
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);

// Start the server
const port = process.env.PORT || 3000; // Port number
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
