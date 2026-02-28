class ApiSuccessResponse{
    constructor(message="success", status = 200, data){
        this.success=true;
        this.message=message;
        this.status=status;
        this.data=data;
    }
}

class ApiErrorResponse{
    constructor(message, status , errors=[]){
        this.success=false;
        this.message=message;
        this.status=status;
        this.errors=errors;
    }
}

export {ApiErrorResponse , ApiSuccessResponse}