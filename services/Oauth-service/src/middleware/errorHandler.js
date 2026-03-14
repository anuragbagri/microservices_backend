import { ApiErrorResponse } from "../utils/ApiResponse.js";

export async function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 400;
  const message = err.message || "Something went wrong";

  if (err.isOperational) {
    return res
      .status(statusCode)
      .json(new ApiErrorResponse(false, message, statusCode, err.errors || []));
  }

  return res.status(500).json(
    new ApiErrorResponse(false, "Internal server error", 500),
  );
}
