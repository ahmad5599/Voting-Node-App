const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
  // Check if the token is present in the headers
  if (!req.headers.authorization) return res.status(401).json({ error: "Token not found" });

  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userData = decodedData;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Invalid token" });
  }
};

const generateToken = (payload) => {
  //remeber that here payload should be an obj so '{payload}' is ok but 'payload' is not
  return jwt.sign({payload}, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
};

module.exports = { jwtAuthMiddleware, generateToken };