const User = require('../schema/user.schema')
const catchAsyncErrors = require('../middleware/catchAsyncError')
const ErrorHandler = require('../utils/errorHandler')
const sendToken = require('../utils/jwtToken')
const sendMailer = require('../utils/sendMail')



//User Registration 
const userRegister = catchAsyncErrors(async(req, res, next)=>{
    const {name, email, password} = req.body
    const user = await User.create({name, email, password})
    
    sendToken(user, 201, res)
})


//User Login 
const userLogin = catchAsyncErrors(async(req, res, next)=>{
    const {email, password} =  req.body

    if(!email || !password){
        return next(new ErrorHandler(400, "Please provide Email and Password"))
    }

    //select("+password") ye line hum isliye include kar rhe hai kyun ke humne password field pe select false kar rakha hai while creating user schema 
    const user = await User.findOne({email}).select("+password")

    if(!user){
        return next(new ErrorHandler(401, "Invalid Email or Password"))
    }

    const isPasswordMatched =  await user.comparePassword(password)

    if(!isPasswordMatched){
        return next(new ErrorHandler(401, "Invalid Email or Password"))
    }

    sendToken(user, 200, res)
})


//logut 

const userLogout = catchAsyncErrors(async(req, res, next)=>{
    res.cookie('token', null,{
        expires: new Date(Date.now()),
        httpOnly: true
    })

    return res.status(200).json({success: true, message: "logged out"})

})

// forget Password 

const forgetPassword = catchAsyncErrors(async(req, res, next)=>{

    const user = await User.findOne({email: req.body.email})

    if(!user){
        return next(new ErrorHandler(401, 'Please provide valid Email address'))
    }
    
    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false });

    const resetPasswordLink = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n${resetPasswordLink} \n\nWhich will be valid for 15 mins. \n\nIf you have not requested this email then, please ignore it.`;

    const options = {
        to: req.body.email,
        subject: 'Password Recovery Mail', 
        text: message
    }

    try{
        const info = await sendMailer(options)
        return res.status(200).json({
            success: true, 
            message: 'Password reset link has been shared on your email'

        })
    }

    catch(error){
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({validateBeforeSave: false})
        return next(new ErrorHandler(500, error.message)) 
    }


})

//password reset 

const passwordReset = catchAsyncErrors(async(req, res, next)=>{

    const user = await User.findOne({resetPasswordToken: req.params.token, resetPasswordExpire: {$gt: Date.now()}})

    if(!user){
        return next(new ErrorHandler(400, 'Reset password token is invalid or has been expired'))
    }

    if(!req.body.password || !req.body.confirmPassword){
        return  next(new ErrorHandler(400, 'Please provide password to update')) 
    }

    if(req.body.password !== req.body.confirmPassword ){
        return next(new ErrorHandler(400, 'Pasword does not matched')) 
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({validateBeforeSave: false})

    return res.status(200).json({success: true, message: 'Password has been reset successfully', user})

})

//get user details 

const getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id)
    return res.status(200).json({success: true, user})
})



//update password 

const updatePassword  =  catchAsyncErrors(async(req, res, next)=>{
    const user =  await User.findById(req.user.id).select('+password')
    if(!user){
        return next(new ErrorHandler(401, 'Please login to access the resource'))
    }

    if(!req.body.oldPassword){
        return next(new ErrorHandler(400, 'Please provide Old Password'))
    }

    const isPasswordMatchecd = await user.comparePassword(req.body.oldPassword)
    if(!isPasswordMatchecd){
        return next(new ErrorHandler(400, 'Old password is incorrect'))
    }

    if(!req.body.newPassword || !req.body.confirmPassword){
        return next(new ErrorHandler(400, 'Please provide new password'))
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler(400, 'Password does not match'))
    }

    user.password = req.body.newPassword
    await user.save()

    sendToken(user,200,res)
})


// update user profile 
const updateUserProfile =  catchAsyncErrors(async(req, res, next)=>{
    const userData = {}
    
    if(req.body.name){
        userData.name = req.body.name
    }

    if(req.body.email){
        userData.email = req.body.email
    }

    const user =  await User.findByIdAndUpdate(req.user.id, userData, {
        new: true, //gives the updated document
        runValidators: true, // it does the validaton if we have any on our field, before saving the data in DB
        useFindAndModify: false //it tell to use findByIdAndUpdate method instead of modifyAndUpdate which is deprecated 
    })

    return res.status(200).json({success: true, message: 'Proifle Updated', user})
 
})

//Get All User  --ADMIN

const getAllUsers =  catchAsyncErrors(async(req, res, next)=>{
    const users = await User.find()

    return res.status(200).json({success: true, message: 'All Users Data', users})
})


//Get Single User -- Admin

const getSingleUser = catchAsyncErrors(async(req, res, next)=>{
    const user =  await User.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler(400, 'User dont Exist'))
    }

    return res.status(200).json({success: true, message:`${user.name} Details`, user})

})

//update user role --ADMIN

const updateUserRole =  catchAsyncErrors(async(req, res, next)=>{
    const userData = {
        name: req.body.name,
        email: req.body.email, 
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, userData, {
        new: true, 
        runValidators: true, 
        useFindAndModify: false
    })

    return res.status(200).json({succss: true, message: 'Role has been updated', user})

})

//delete user --ADMIN

const deletUser =  catchAsyncErrors(async(req, res, next)=>{
    const user = await User.findByIdAndDelete(req.params.id);
    if(!user){
        return next(new ErrorHandler(400, 'User does not exist'));
    }
    
    return res.status(200).json({success: true, message: 'User has been deleted', user})

})


module.exports = {userRegister, userLogin, userLogout, forgetPassword, passwordReset, getUserDetails, updatePassword, updateUserProfile,
    getAllUsers, getSingleUser, updateUserRole, deletUser}