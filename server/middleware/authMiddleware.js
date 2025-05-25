const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized - Invalid auth format" });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token - " + err.message });
  }
};

module.exports = requireAuth;
