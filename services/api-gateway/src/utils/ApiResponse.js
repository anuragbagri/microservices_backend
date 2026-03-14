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

export { ApiFailResponse, ApiSuccessResponse };
