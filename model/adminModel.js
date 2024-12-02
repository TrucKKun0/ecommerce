const mongoose = require('mongoose');



const adminSchema = mongoose.Schema({
   email:String,
   password:String,
   username:String
    
});

module.exports = mongoose.model("admin",adminSchema);