class ErrorHandler extends Error{
    constructor(statusCode, message){
        super(message); // calling Error Class Constructor 
        this.statusCode = statusCode
        Error.captureStackTrace(this, this.constructor) // accessing error class method captureStackTrace to capture error stack, first argument konse class pe call karna hai and second argument us class ka constructor

    }
}

module.exports = ErrorHandler