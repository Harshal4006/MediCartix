class AppError extends Error {
  constructor(message, { statusCode = 500, logLabel = "Error" } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.logLabel = logLabel;
    this.isOperational = true;
  }

  static notFound(resource = "Resource") {
    return new AppError(`${resource} not found`, { statusCode: 404, logLabel: "Not found" });
  }

  static forbidden() {
    return new AppError("Forbidden", { statusCode: 403, logLabel: "Forbidden" });
  }

  static badRequest(message = "Bad request") {
    return new AppError(message, { statusCode: 400, logLabel: "Bad request" });
  }

  static missingField(field) {
    return new AppError(`${field} is required`, { statusCode: 400, logLabel: "Validation" });
  }
}

export default AppError;
