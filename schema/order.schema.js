const mongoose = require('mongoose')

const orderSchema =  new mongoose.Schema({
    shippingInfo:{
        name:{
            type: String,
            required: true
        },
        address:{
            type: String, 
            required: true
        },
        city:{
            type: String, 
            required: true
        }, 
        state:{
            type: String,
            required: true
        },
        pinCode:{
            type: Number, 
            required: true
        },
        phoneNumber: {
            type: Number,
            required: true
        }
    },

    orderItems:[{
        productId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product', 
            required: true
        }, 

        productName:{
            type: String, 
            required: true
        }, 

        price:{
            type: Number, 
            required: true
        },
        quantity:{
            type: Number,
            required: true
        },
        image:{
            type: String, 
        }
    }],

    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required: true,
    },

    paymentInfo:{
        id: {
            type: String, 
            required: true
        },

        status:{
            type: String, 
            required: true
        }
    },

    paidAt: {
        type: Date, 
    },

    itemsPrice:{
        type: Number,
        required: true
    },
    
    taxPrice:{
        type: Number,
        required: true
    },

    shippingPrice:{
        type: Number, 
        required: true
    },

    totalPrice:{
        type: Number, 
        required: true
    },

    orderStatus:{
        type: String,
        required: true, 
        default: 'Processing'
    },
    deliveredAt: Date,
    createdAt:{
        type: Date,
        default: Date.now()
    }

})

module.exports = mongoose.model('Order', orderSchema)