const mongoose = require("mongoose");

const cartSchema =  mongoose.Schema({
    productid:{
        type:mongoose.Types.ObjectId,
        ref:"product"
    },
    subtotal:{
        type:Number,
        default:0
    },
    total:Number,
    userid:{
        type: mongoose.Types.ObjectId,
        ref:"user"
    },
    quantity:{
        type:Number,
        default:1
    }
    
});

module.exports = mongoose.model("cart",cartSchema);