const express = require("express");
const routes = express.Router();
const User = require("../models/user"); // Ensure this file exists and is correctly configured
const { jwtAuthMiddleware, generateToken } = require("../jwt");

routes.post("/signup", async (req, res) => {
  const data = req.body; // Corrected from req.data to req.body
  const newUser = new User(data);

  try {
    //check is cnic is already registered
    const existingUser = await User.findOne({ cnicNumber: newUser.cnicNumber });
    if (existingUser) {
      console.log("CNIC already exists");
      return res.status(400).json({ error: "CNIC already exists" });
    }

    //check if there is already an admin user if there is no new admin user can be created
    const admin = req.body.role === "admin";
    if (admin) {
      console.log("Admin already exists there can only be one admin at a time");
      return res.status(400).json({
        error: "Admin already exists there can only be one admin at a time",
      });
    }

    const savedUser = await newUser.save();
    console.log("User data saved successfully", savedUser);

    const payload = {
      id: savedUser.id,
    };

    const newToken = generateToken(payload);

    res.status(200).json({ response: savedUser, token: newToken });
  } catch (error) {
    console.log("Error saving User data:", error);
    res.status(500).json({ error: "Error saving User data" });
  }
});

routes.post("/login", async (req, res) => {
  const { cnicNumber, password } = req.body;

  try {
    const user = await User.findOne({ cnicNumber: cnicNumber });
    if (!user) {
      console.log("Incorrect cnicNumber");
      return res.status(401).json({ error: "Incorrect cnicNumber" });
    }
    if (!(await user.comparePassword(password))) {
      console.log("Incorrect password");
      return res.status(401).json({ error: "Incorrect password" });
    }

    const payload = {
      id: user.id,
    };

    const newToken = generateToken(payload);
    // console.log("Token:", newToken);
    res.status(200).json({ token: newToken });
  } catch (error) {
    console.log("Error logging in:", error);
    res.status(500).json({ error: "Error logging in" });
  }
});

routes.get("/profile", jwtAuthMiddleware, async (req, res) => {
  //check if token is present in the headers
  if (!req.headers.authorization)
    return res.status(401).json({ error: "Token not found" });
  try {
    const user = req.userData.payload;
    // console.log("User data fetched successfully", user);

    const userId = user.id;
    const userData = await User.findById(userId);

    res.status(200).json(userData);
  } catch (error) {
    console.log("Error fetching user data:", error);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

routes.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  const userId = req.userData.payload.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const existingUser = await User.findById(userId);

    // Check if the user exists
    if (!existingUser) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the current password is correct
    if (!(await existingUser.comparePassword(currentPassword))) {
      console.log("Incorrect password");
      return res.status(401).json({ error: "Incorrect password" });
    }

    //update password
    existingUser.password = newPassword;
    const response = await existingUser.save();

    res
      .status(200)
      .json({ message: "User password updated successfully", data: response });
    console.log("User password updated successfully", response);
  } catch (error) {
    console.log("Error updating User password:", error);
    res.status(500).json({ error: "Error updating User password" });
  }
});

module.exports = routes;
