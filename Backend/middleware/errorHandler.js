import AppError from "../utils/AppError.js";
import { logger } from "../config/logger.js";

export const notFound = (req, res, next) => {
  next(new AppError(`Not Found - ${req.originalUrl}`, { statusCode: 404, logLabel: "Route" }));
};

export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message || "Server Error";
  let logLabel = err.logLabel || "Error";

  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation Error";
    logLabel = "Mongoose validation";
    return res.status(400).json({
      success: false,
      message,
      errors: Object.values(err.errors || {}).map((e) => e.message)
    });
  }

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID format";
    logLabel = "Cast error";
  }

  if (err.code === 11000) {
    status = 409;
    message = "Duplicate field value";
    logLabel = "Duplicate key";
  }

  logger.error(`${logLabel}: ${err.message}`, {
    status,
    url: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });

  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === "production" && status === 500
      ? "Server Error"
      : message
  });
};
