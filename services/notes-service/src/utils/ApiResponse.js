class ApiSuccessResponse{
    constructor(message = "Success", statusCode =200 ,data){
        this.success=true;
        this.statusCode=statusCode,
        this.message=message;
        this.data=data;
    }

}


class ApiErrorResponse{
    constructor(message, statusCode = 500, errors = []){
        this.success =false;
        this.statusCode=statusCode;
        this.message=message;
        this.errors=errors;
    }
}


export {ApiErrorResponse , ApiSuccessResponse};
