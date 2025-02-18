const mongoose = require("mongoose");

const checkoutSchema =  mongoose.Schema({
    username:String,
    
    email:String,
    city:String,
    state:String,
    address:String,
    userid:{
        type: mongoose.Types.ObjectId,
        ref:"user"
    },
    date:{
        type:Date,
        default:Date.now()
    }
});

module.exports = mongoose.model("checkout",checkoutSchema);