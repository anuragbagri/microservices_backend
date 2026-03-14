class ApiSuccessResponse {
  constructor(success = "true", message, statusCode = 200, data) {
    this.success = true;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }
}

class ApiErrorResponse {
  constructor(success = "false", message, statusCode, errors = []) {
    this.success = false;
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export { ApiErrorResponse, ApiSuccessResponse };
