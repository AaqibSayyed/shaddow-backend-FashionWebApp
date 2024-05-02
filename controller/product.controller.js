const Product = require('../schema/product.schema.js')
const ErrorHandler = require('../utils/errorHandler.js')
const catchAsyncErrors = require('../middleware/catchAsyncError')
const ApiFeature =  require('../utils/apiFeature.js')

//createProduct
const createProduct = catchAsyncErrors(async (req, res, next) =>{
    req.body.created_by =  req.user.id
    let product = await Product.create(req.body)
    return res.status(201).json({success: true, message:'Product added successfully', data: product})
})


//getAllProducts
const getAllProducts = catchAsyncErrors(async(req, res, next)=>{
    let productCount = await Product.countDocuments()
    let apiFeature = new ApiFeature(Product, req.query).search().filter().pagination()
    let product = await apiFeature.query

    if(!product) {
        return next(new ErrorHandler(404, 'Product not found'))
    }

    return res.status(200).json({success: true, data: product, productCount})
})

//getSingleProduct
const getProduct = catchAsyncErrors(async(req, res, next)=>{
    let product = await Product.findById(req.params.id)
    if(!product) {
        return next(new ErrorHandler(404, 'Product not found'))
    }

    return res.status(200).json({success: true, data: product})
})

//updateProduct
const updateProduct = catchAsyncErrors(async(req, res, next)=>{

    let product  = await Product.findById(req.params.id)
    if(!product) {
        return next(new ErrorHandler(404, 'Product not found'))
    }

    if(Object.keys(req.body).length ===0) {
        return next(new ErrorHandler(400, 'No items updated'))
    }

    let productUpdate = await Product.findByIdAndUpdate(req.params.id, req.body)
        return res.status(200).json({success: true, message: 'Prodcut updated successfully'})
})

//deleteProduct
const deleteProduct = catchAsyncErrors(async (req,res, next)=>{
    let product  =  await Product.findById(req.params.id)
    if(!product) {
        return next(new ErrorHandler(404, 'Product not found'))
    }

    let deleteProduct = await Product.deleteOne({_id: req.params.id})
        return res.status(200).json({success: true, message: "Prodcut deleted successfully", data: deleteProduct})
})

//create or update review 

const createOrUpdateReview = catchAsyncErrors(async(req, res, next)=>{
    const {rating, comment, productId} = req.body

    const user_review = {
        user: req.user._id, 
        name: req.user.name, 
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)   

  

    const isReviewed = product.reviews.find((rev)=> {
        return rev.user.toString() === user_review.user.toString()})

    let totalRating = 0;
    if(isReviewed){
        product.reviews.forEach((rev)=>{
            totalRating += rev.rating
            if(rev.user.toString() === user_review.user.toString()){
                rev.rating = user_review.rating
                rev.comment = user_review.comment
            }
        })
    }
    
    else{
        product.reviews.push(user_review)
        product.numOfReviews = product.reviews.length
    }
    
    product.ratings = totalRating/product.reviews.length

    await product.save({validateBeforeSave: false})

    return res.status(200).json({success: true, message: 'Thank you for your feedback for the product', product})


})

//get all reviews of a product 

const getProductReviews = catchAsyncErrors(async(req, res, next)=>{
    const product = await Product.findById(req.query.productId)
    if(!product){
        return next(new ErrorHandler(400, 'Product not found'))
    }

    return res.status(200).json({success: true, message: 'Please find below product reviews', reviews: product.reviews})
})


//delete review

const deleteReview = catchAsyncErrors(async(req, res, next)=>{
    const product =  await Product.findById(req.query.productId)
    if(!product){
        return next(new ErrorHandler(400, 'Product not found'))
    }
    

    const reviews = product.reviews.filter((rev)=>{
        return rev._id.toString() !== req.query.review_id.toString()
    })


    if(reviews.length ==0){
        product.ratings = 0
    }

    else{
        let total_rating=0
        reviews.forEach((rev)=>{
            total_rating+=rev.rating
        })    
        product.ratings = total_rating/reviews.length
    }

    product.reviews = reviews
    product.numOfReviews = reviews.length

    product.save({validateBeforeSave: false})

    return res.status(200).json({success: true})

})

module.exports = {
    createProduct,
    getProduct,
    getAllProducts, 
    updateProduct,
    deleteProduct,
    createOrUpdateReview,
    getProductReviews,
    deleteReview
}