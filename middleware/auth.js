const catchAsyncError = require('./catchAsyncError')
const erroHandler =  require('../utils/errorHandler')
const jwt = require('jsonwebtoken')
const User = require('../schema/user.schema')
const ErrorHandler  = require('../utils/errorHandler')
const isAuthenticated = catchAsyncError(async(req, res, next)=>{
   const {token} = req.cookies

   if(!token){
    return next(new erroHandler(401, "Please login to access the resource"))
   }

   const decodeToken = jwt.verify(token, process.env.jwtSecretkey)
   if(!decodeToken){
    return next(new erroHandler(401, "Please login to access the resource"))
   }

   req.user = await User.findById(decodeToken.id)

   next()

})


const isAuthorizeRole = (...role)=>{
    return function(req, res, next){
        if(!role.includes(req.user.role)){
            return next(new ErrorHandler(401, `You are not allowed to access this resoruce`))
        }        
        next()
    }

}



module.exports = {isAuthenticated,isAuthorizeRole}