import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  if (
    req.path === "/users/login" ||
    req.path === "/users/register" ||
    req.path.startsWith("/users/verify-email")
  ) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token format." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

export default verifyToken;
