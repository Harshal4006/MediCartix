import jwt from "jsonwebtoken";
import { logger } from "../config/logger.js";

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }
  const token = req.headers.token;
  if (typeof token === "string" && token.startsWith("Bearer ")) {
    return token.slice("Bearer ".length).trim();
  }
  return token || null;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }

    if (!process.env.JWT_SECRET) {
      logger.error("JWT_SECRET environment variable not set");
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.body.userId = decoded.id;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token."
      });
    }

    logger.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication service error"
    });
  }
};

export default authMiddleware;
