const ErrorHandler = require('../utils/errorHandler')

module.exports = (err,req,res,next)=>{
    err.statusCode =  err.statusCode || 500
    err.message = err.message || 'Internal Server Error'

    //wrong mongo db id error
    if (err.name === 'CastError'){
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(400, message)
    }

    // MongoDB Duplicate Error
    if(err.code === 11000){
        const message = `Provided ${Object.keys(err.keyValue)} already exist`
        err = new ErrorHandler(400, message)
    }
    
    //Wrong JWT error 
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again `;
        err = new ErrorHandler(400, message)
      }

    
    res.status(err.statusCode).json({
        success: false, 
        message: err.message
    })
}