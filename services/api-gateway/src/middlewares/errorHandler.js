import { ApiErrorResponse } from "../utils/ApiResponse.js";

function errorHandlerMiddleware(err, req, res, next) {
  const errorStatusCode = err.statusCode ?? 500;
  const errorMessage = err.message ?? "something went wrong";

  if (err.isOperational) {
    return res
      .status(errorStatusCode)
      .json(new ApiErrorResponse(errorMessage, errorStatusCode, err.errors));
  }
  return res
    .status(500)
    .json(new ApiErrorResponse("internal server error", 500));
}

export { errorHandlerMiddleware };
