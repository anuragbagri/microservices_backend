class AppError extends Error {

    constructor(message,status, errors = []){
        super(message)
            this.status = status;
            this.errors=errors;
            this.isOperational=true;
    }
}

export default AppError;
