const mongoose = require('mongoose');

mongoose.connect(`mongodb://127.0.0.1:27017/ecommerce`);

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    cart: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'product',
            required: true,
          
        }
      ],
    order: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'checkout',
            required: true,
          
        }
      ],
    password: String,
    
});

module.exports = mongoose.model("user",userSchema);