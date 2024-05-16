const mongoose = require ('mongoose')

const productSchema  = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please provide Product Name'], 
        trim: true
    }, 
    description:{
        type: String, 
        required: [true, 'Please provide Product Description'], 
    }, 
    price:{
        type: Number, 
        required: [true, 'Please provide Product Price'], 
    }, 
    ratings:{
        type: Number, 
        default:0
    }, 
    images:[
        {
         public_id: {
            type: String, 
            required: true
         }, 
         url:{
            type: String, 
            required: true
         },   
        }
    ], 
    category: {
        type: String, 
        required: [true, "Please provide Product Category"]
    }, 
    subCategory: {
        type: String, 
        required: [true, "Please provide Product Sub Category"]
    }, 
    stock:{
        type: Number, 
        required: [true, "Please provide the Stock"], 
    }, 
    numOfReviews:{
        type: Number, 
        default: 0
    }, 
    reviews:[{
        user: {
            type: mongoose.Schema.ObjectId,
            ref:'user', 
            required: true
        },
        name:{
            type: String, 
            required: true
        }, 
        rating:{
            type: Number, 
            required: true
        }, 
        comment:{
            type: String,
            required: true
        }
    }], 

    created_by: {
        type: mongoose.Schema.ObjectId,
        ref:'user', 
        required: true
    } 
}, {timestamps: true})

module.exports =  mongoose.model('Product', productSchema)

