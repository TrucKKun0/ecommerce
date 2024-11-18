const mongoose = require('mongoose');



const productSchema = mongoose.Schema({
    productName: String,
    productPrice:Number,
    productDescription:String,
    productImage:String,
    date:{
        type:Date,
        default:Date.now()
    }
    
});

module.exports = mongoose.model("product",productSchema);