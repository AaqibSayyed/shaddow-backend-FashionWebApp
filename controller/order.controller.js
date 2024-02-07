const Order = require('../schema/order.schema')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncError')
const Product = require('../schema/product.schema')

//create order

const createOrder = catchAsyncErrors(async(req, res, next)=>{
    const {shippingInfo, orderItems, paymentInfo, itemsPrice,taxPrice,shippingPrice,totalPrice} = req.body
    const user = req.user.id
    shippingInfo.name = req.user.name
     
    const order = await Order.create({
        shippingInfo, orderItems, paymentInfo, itemsPrice,taxPrice,shippingPrice,totalPrice,user
    })

    return res.status(201).json({success: true, message:'Order has been placed', order})

}) 

//get single order -- admin

const getSingleOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate('user','name email') //populate method user collection se name and email field de dega


    if(!order){
        return next(new ErrorHandler(400, 'Order Not Found'))
    }

    return res.status(200).json({success: true, message: 'Please find below order details', order})

})

//get logged in users order 

const getUserOrders =  catchAsyncErrors(async(req, res, next)=>{
    const userOrders = await Order.find({user: req.user._id})

    return res.status(200).json({sucess: true, message: 'Please find your order details below', userOrders})
})


//get All Orders -- admin

const getAllOrders =  catchAsyncErrors(async(req, res, next)=>{
    const allOrders = await Order.find()
    let toalAmount = 0


    if(!allOrders){
        toalAmount = 0
    }

    else{
        allOrders.forEach((order)=>{
            toalAmount+=order.totalPrice
       })
    }
  
    return res.status(200).json({success: true, message: 'Please find all orders below', orders: {allOrders,toalAmount}})

})

//delete order  -- admin
const deleteOrder = catchAsyncErrors(async(req, res, next)=>{
    const order = await Order.findByIdAndDelete(req.params.id)
    console.log('roder', order)
    if(!order){
        return next(new ErrorHandler(404, 'Order not found'))
    }


    return res.status(200).json({success: true, message: 'Order has been removed successfully', order})
})


//update order 


const updateOrder = catchAsyncErrors(async(req, res, next)=>{
    const order = await Order.findById(req.params.id)
    if(!order){
        return next(new ErrorHandler(404, 'Order not found'))
    }

    if(order.orderStatus === 'Delivered'){
        return next(new ErrorHandler(400, 'You have already delivered this product'))
    }

    order.orderStatus = req.body.status

    if(order.orderStatus === 'Shipped'){
        order.orderItems.forEach(async(o)=>{
            await updateStock(o.productId, o.quantity)
        })
    }

    if(order.orderStatus === 'Delivered'){
        order.deliveredAt = Date.now()
    }

    await order.save()

    return res.status(200).json({success: true, mesaage: 'Product status has been updated', order})
})

async function updateStock(productId, quantity){
    const product= await Product.findById(productId)
            product.stock -= quantity
            await product.save({validateBeforeSave: false})
}

module.exports = {createOrder, getSingleOrder, getUserOrders, getAllOrders, deleteOrder, updateOrder}