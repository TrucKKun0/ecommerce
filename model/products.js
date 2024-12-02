const mongoose = require('mongoose');



const productSchema = mongoose.Schema({
    productName: String,
    productPrice:Number,
    productDescription:String,
    productImage:String,
    productQuantity: Number,
    date:{
        type:Date,
        default:Date.now()
    },
    productCategory: String
    
});

module.exports = mongoose.model("product",productSchema);