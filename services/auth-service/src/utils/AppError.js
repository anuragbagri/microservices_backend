class AppError extends Error{
    constructor(message , statuscode , errors =[]){
        super(message);
        this.statuscode=statuscode;
        this.errors=errors;
        this.isOperational=true; // marks it a known handled error
    }
}



export default AppError;