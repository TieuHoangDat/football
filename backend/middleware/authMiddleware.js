const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Không có token" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token không hợp lệ" });
  }
};

module.exports = authMiddleware;
