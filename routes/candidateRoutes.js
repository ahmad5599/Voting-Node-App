const express = require("express");
const routes = express.Router();
const Candidate = require("../models/candidate"); // Ensure this file exists and is correctly configured
const User = require("../models/user"); // Ensure this file exists and is correctly configured
const { jwtAuthMiddleware } = require("../jwt");

const checkAdminRole = async (userID) => {
  const user = await User.findById(userID);
  if (user.role === "admin") {
    return true;
  }
  return false;
};

//post routes to add candidate
routes.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (await !checkAdminRole(req.userData.payload.id)) {
      return res
        .status(401)
        .json({ error: "Unauthorized access user is not admin" });
    }
    const data = req.body; // Corrected from req.data to req.body
    //create new candidate
    const newCandidate = new Candidate(data);
    //save new candidate
    const response = await newCandidate.save();
    console.log("Candidate data saved successfully", response);
    res
      .status(200)
      .json({ response: "Candidate data saved successfully", data: response });
  } catch (error) {
    console.log("Error saving Candidate data:", error);
    res.status(500).json({ error: "Error saving Candidate data" });
  }
});

//update candidate data
routes.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (await !checkAdminRole(req.userData.payload.id)) {
      return res
        .status(401)
        .json({ error: "Unauthorized access user is not admin" });
    }
    console.log();
    const candidateID = req.params.candidateID;
    const updatedCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedCandidateData,
      { new: true, runValidators: true }
    );

    if (!response) {
      console.log("Candidate not found");
      return res.status(404).json({ error: "Candidate not found" });
    }
    console.log("Candidate data updated successfully", response);
    res
      .status(200)
      .json({ message: "Candidate data updated successfully", data: response });
  } catch (error) {
    console.log("Error updating Candidate data:", error);
    res.status(500).json({ error: "Error updating Candidate data" });
  }
});

//delete candidate data
routes.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (await !checkAdminRole(req.userData.payload.id)) {
      return res
        .status(401)
        .json({ error: "Unauthorized access user is not admin" });
    }
    const candidateID = req.params.candidateID;

    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      console.log("Candidate not found");
      return res.status(404).json({ error: "Candidate not found" });
    }
    console.log("Candidate data Deleted successfully", response);
    res
      .status(200)
      .json({ message: "Candidate data Deleted successfully", data: response });
  } catch (error) {
    console.log("Error Deleting Candidate data:", error);
    res.status(500).json({ error: "Error Deleting Candidate data" });
  }
});

//voting
routes.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  const candidateID = req.params.candidateID;
  const userID = req.userData.payload.id;

  try {
    // Check if the candidate exists
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Check if the user exists
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Check if the user has already voted
    if (user.isVoted) {
      return res.status(400).json({ error: "User has already voted" });
    }
    //check is user is admin
    if (user.role === "admin") {
      return res.status(400).json({ error: "Admin cannot vote" });
    }

    // Increment the vote count and add the user to the voter's list of the candidate
    candidate.votes.push({ user: userID });
    candidate.voteCount++;
    //change the isvoted boolean to true for the user
    user.isVoted = true;

    // Save the updated candidate and user
    await candidate.save();
    await user.save();

    console.log("User voted successfully");
    res.status(200).json({ message: "User voted successfully" });
  } catch (error) {
    console.log("Error voting for candidate:", error);
    res.status(500).json({ error: "Error voting for candidate" });
  }
});

//get current vote count
routes.get("/vote/count", async (req, res) => {
  try {
    const candidate = await Candidate.find().sort({ voteCount: "desc" });
    const record = candidate.map((data) => {
      return {
        party: data.party,
        voteCount: data.voteCount,
      };
    });
    console.log("Vote count retrieved successfully");
    res
      .status(200)
      .json({ message: "Vote count retrieved successfully", data: record });
  } catch (error) {
    console.log("Error getting vote count:", error);
    res.status(500).json({ error: "Error getting vote count" });
  }
});

module.exports = routes;
