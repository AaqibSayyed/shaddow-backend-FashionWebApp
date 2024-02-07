const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true,"Please enter your Name"], 
        maxLength: [20, "Name cannot exceed more than 20 characters"], 
        minLength:[4,"Name should contain more than 4 characters"]
    },

    email:{
        type:String, 
        required:[true, "Please enter your Email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid Email"]
    },
    
    password:{
        type: String, 
        required: [true, "Please enter your Password"], 
        minLength:[8, "Password should contain minimum 8 characters"],
        select: false //jab find query chalauga DB me userSchema me to password field nhi aayega usem
    },

    avatar: {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
    },

    role:{
        type:String, 
        default: "user"
    }, 

    resetPasswordToken: String,
    resetPasswordExpire: Date,  

}, {timestamps: true})


userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next() //agar password modifie nhi hua hai to next call.. next call karege to handler pass ho jayega next function ko.. is case me next karne ke baad database me insert ho jayega 

    }
    // if password is modified
    this.password = await bcrypt.hash(this.password,10)

}) //ye ek event hai jo aapko allow karta hai database pe data fetch hone se pehle kuch action perform karo.. hum yaha database me data save hone se pehel password ko encrypt kar rhe hai


//adding JWT get token method to userSchema 
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id: this._id}, process.env.jwtSecretkey, {
        expiresIn: process.env.jwtExpires
    })
}

userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password, this.password)
}


// generating reset resetPasswordToken & resetPasswordExpire

userSchema.methods.getResetPasswordToken = function () {
    // generate reset token 
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hash the reset token and set it to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // set the expiration time for the reset token
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    // return the unhashed reset token for sending to the user
    return resetToken;
};


  
module.exports = mongoose.model("User", userSchema)




