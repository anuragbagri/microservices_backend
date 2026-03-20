class ApiSuccessResponse {
  constructor(success, statusCode, message, data) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

class ApiFailResponse {
  constructor(success, statusCode, message, error) {
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
  }
}

class ApiErrorResponse {
  constructor(message, statusCode = 500, errors = []) {
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }
}

export { ApiErrorResponse, ApiFailResponse, ApiSuccessResponse };
