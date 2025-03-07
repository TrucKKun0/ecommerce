const cookieParser = require('cookie-parser');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const userModel = require('./model/user');
const adminModel = require("./model/adminModel.js");
const checkoutModel = require("./model/checkout.js");
const cartModel = require("./model/cartModel.js");

const path = require('path');
const productModel = require('./model/products');
const upload = require('./config/multerconfig.js');
const expressSession = require("express-session");
const flash = require("connect-flash");

require("dotenv").config();

app.use(
  expressSession({
      resave:false,
      saveUninitialized : false,
      secret : process.env.EXPRESS_SESSION_SECRET,
  })
)
app.use(flash());

// Middleware setup
app.use(express.urlencoded({ extended: true }));  // For form data
app.use(express.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'config')));
app.set('view engine', 'ejs');

// Route to render the index page
app.get('/', isLoggedIn,async (req, res) => {
  try {
      // Fetch all products
      let products = await productModel.find();

      // Decode the token to get the email
      const token = req.cookies.token;
      const decoded = jwt.verify(token, 'shhhh');
      const email = decoded.email;

      // Fetch the user and populate the cart
      const user = await userModel.findOne({ email }).populate('cart');
      const cartCount = user && user.cart ? user.cart.length : 0; 
      console.log(cartCount);
      // Calculate cart count

      // Filter products by categories
      const electronics = products.filter(product => product.productCategory === "electronics");
      const feature = products.filter(product => product.productCategory === "feature");
      const homeandliving = products.filter(product => product.productCategory === "homeandliving");
      const sports = products.filter(product => product.productCategory === "sports");
      const fashion = products.filter(product => product.productCategory === "fashion");
      const slider = products.filter(product => product.productCategory === "slider");

      // Flash message for success
      let success = req.flash("success");

      // Render the index page with all the data
      res.render('index', { 
          email,
          electronics, 
          feature, 
          homeandliving, 
          sports, 
          fashion, 
          cartCount, // Pass cart count to the frontend
          success,
          slider
      });
  } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).send("Internal Server Error");
  }
});

app.get('/search', isLoggedIn,async (req, res) => {
  const token = req.cookies.token;
      const decoded = jwt.verify(token, 'shhhh');
      const email = decoded.email;
  let { q } = req.query;
  console.log('Search query:', q);
  const user = await userModel.findOne({ email }).populate('cart');
      const cartCount = user && user.cart ? user.cart.length : 0; 
  if (!q || !q.trim()) {
    return res.status(400).json({ success: false, message: 'Search term is required' });
  }

  q = q.trim();

  try {
    const products = await productModel.find({
      productName: { $regex: new RegExp(q, 'i') }
    });

    console.log('Products being sent to searchPage:', products);
    res.render('searchPage', { products, q,cartCount });

  } catch (error) {
    console.error('Error searching for products:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/cart', isLoggedIn, async (req, res) => {
  try {
      // Fetch the user and populate the cart with product details
      const user = await userModel.findOne({ email: req.user.email }).populate('cart');

      if (!user || !user.cart || user.cart.length === 0) {
          // If the cart is empty, render the cart page with default values
          return res.render('cart', { 
              user, 
              cartCount: 0,  // Send cart count as 0
              subtotal: 0, 
              totalPrice: 0 
          });
      }

      // Calculate the subtotal
      const subtotal = user.cart.reduce((sum, item) => {
          return sum + item.productPrice; // Summing up product prices in the cart
      }, 0);

      // Calculate total price (including platform fee)
      const platformFee = 100; // Fixed platform fee
      const totalPrice = subtotal + platformFee;

      // Calculate cart count
      const cartCount = user.cart.length;

      // Render the cart page with cart count, subtotal, and total price
      res.render('cart', { user, cartCount, subtotal, totalPrice });
  } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).send('Server error');
  }
});


app.get('/cart/remove/:productId', isLoggedIn, async (req, res) => {
  try {
      const productId = req.params.productId;

      // Find the user
      const user = await userModel.findOne({ email: req.user.email });

      if (!user) {
          return res.status(404).send('User not found');
      }

      // Remove the product from the user's cart
      user.cart = user.cart.filter(item => item.toString() !== productId);
      
      // Save the updated user data
      await user.save();

      // Remove the product from cartModel
      await cartModel.deleteOne({ productId });

      res.redirect('/cart');
  } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).send('Server error');
  }
});



app.post('/cart', isLoggedIn, async (req, res) => {
  try {
      // Find the user
      let user = await userModel.findOne({ email: req.user.email });
      if (!user) {
          return res.status(404).send('User not found');
      }

      // Find the product by name
      const { productName } = req.body;
      let product = await productModel.findOne({ productName });
      if (!product) {
          return res.status(404).send('Product not found');
      }

      // Initialize the cart if not already done
      if (!Array.isArray(user.cart)) {
          user.cart = [];
      }

      // Add product to the user's cart if not already added
      if (!user.cart.includes(product._id.toString())) {
          user.cart.push(product._id);
          await user.save(); // Save the updated user cart
      }

      // Check if the product already exists in `cartModel`
      let cartItem = await cartModel.findOne({ userId: user._id, productId: product._id });

      if (cartItem) {
          // If product already exists in cart, increase the quantity
          cartItem.quantity += 1;
          cartItem.total = cartItem.quantity * product.price; // Update total price
          await cartItem.save();
      } else {
          // If product is not in cart, create a new entry
          await cartModel.create({
              userId: user._id,
              productId: product._id,
              quantity: 1,
              total: product.price, // Initial price * quantity (1)
          });
      }

      res.status(200).send('Product added to cart successfully');
  } catch (err) {
      console.error('Error:', err);
      res.status(500).send('Internal server error');
  }
});


app.post('/update-quantity', async (req, res) => {
  try {
      console.log("Incoming Data:", req.body);

      let { productId, quantity, price } = req.body;
      quantity = parseInt(quantity, 10);
      price = parseFloat(price);

      if (isNaN(quantity) || quantity < 1) {
          return res.status(400).json({ error: 'Invalid quantity' });
      }

      if (isNaN(price) || price < 0) {
          return res.status(400).json({ error: 'Invalid price' });
      }

      const total = price * quantity;

      if (isNaN(total)) {
          return res.status(400).json({ error: 'Invalid total' });
      }

      // Update the specific cart item
      const cart = await cartModel.updateOne({ productid:productId }, { $set: { quantity, total } });
      console.log('Cart:', cart);
      

      // Get the updated total cart value
      const cartItems = await cartModel.find({});
      console.log('Cart Items:', cartItems);
      
      const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);
      console.log('Cart Total:', cartTotal);
      
      res.json({ success: true, cartTotal });
  } catch (error) {
      console.error('Error updating quantity:', error);
      res.status(500).json({ error: 'Server error' });
  }
});



app.get('/checkout',isLoggedIn,async (req,res)=>{
  let email = req.body;
  let user = await userModel.findOne({email:req.user.email}).populate("cart");
  const subtotal = user.cart.reduce((sum, item) => {
    return sum + item.productPrice; // Summing up product prices in the cart
}, 0);

// Calculate total price (including platform fee)
const platformFee = 100; // Fixed platform fee
const totalPrice = subtotal + platformFee;


  res.render('checkout',{user,subtotal,totalPrice});
})

app.post("/order/:userid", isLoggedIn, async (req, res) => {
  try {
    const { username, email, city, state, address } = req.body;
    const { userid } = req.params; // Extract userid from the route parameter

    // Check if user exists
    const user = await userModel.findById(userid);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/"); // Redirect to the homepage or an error page
    }

    // Create the order
    const order = await checkoutModel.create({
      username,
      email,
      city,
      state,
      address,
      userid, 
    });

    // Associate the order with the user
    user.order.push(order._id); 
    user.cart = []; // Clear the cart after placing the order
    await user.save(); 
    
    req.flash("success", "Order created successfully");
    return res.redirect("/"); // Redirect to the homepage or a success page
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to create order. Please try again.");
    return res.redirect("/"); // Redirect to an error page or the homepage
  }
});



app.post("/login", async (req, res) => {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) return res.status(500).send("Somthing went wrong");
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
        res.cookie("token", token);
        
        
        res.redirect("/");
      } else return res.send("somethingis worng");
    });
  });


// Route to create a new user
app.post("/create", async (req, res) => {
    let { username,email,password} = req.body;
    let user = await userModel.findOne({ email });
    console.log(username);
    
    if (user) return res.status(500).send("User is already register");
  
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        let user = await userModel.create({
          username,
          
          email,
          password: hash,
        });
        let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
        res.cookie("token", token);
        res.render('auth');
      });
    });
  });



app.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect('/');
});
app.get('/profile/:userid', isLoggedIn,async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email }).populate("cart").populate("order");
  
  const subtotal = user.cart.reduce((sum, item) => {
    return sum + item.productPrice; // Summing up product prices in the cart
}, 0);

// Calculate total price (including platform fee)
const platformFee = 100; // Fixed platform fee
const totalPrice = subtotal + platformFee;
  
  res.render('profile', { user, totalPrice });

});

app.get('/signin',(req,res)=>{
    res.render('auth.ejs');
});
function isLoggedIn(req, res, next) {
    if (req.cookies.token === "") res.redirect("/");
    else {
      let data = jwt.verify(req.cookies.token, "shhhh");
  
      req.user = data;
      next();
    }
  }

// For Admin 
app.get('/admin',adminLoggedIn ,async (req,res)=>{
  
  let products = await productModel.find();
  res.render('Admin', {products});
});
app.get('/admin/addProduct', (req,res)=>{

  res.render('addNewProduct');
});
app.post('/admin/create', upload.single("productImage"), async (req, res) => {  
  
  try {
      // Extract fields from the request body
      let { productName, productDescription, productPrice, productQuantity, productCategory } = req.body;

      // Create a new product in the database
      let product = await productModel.create({
          productName,
          productDescription,
          productPrice,
          productCategory,
          productQuantity
      });

      // Save the image filename to the product document
      if (req.file) {
          product.productImage = req.file.filename;
      }
      await product.save();

      

      // Render the template with the updated products array
      res.redirect('/admin');
  } catch (error) {
      console.error("Error creating product:", error);

      // Handle errors and provide feedback to the user
      res.status(500).send("An error occurred while creating the product.");
  }
});

app.get('/admin/edit/:id', async (req,res)=>{

      let products = await productModel.findOne({ _id: req.params.id});
        
  
  res.render('edit', {products});
});
app.get('/admin/delete/:id', async (req,res)=>{

      let product = await productModel.findOneAndDelete({ _id: req.params.id});
      console.log(product);
  res.redirect('/admin');
});


app.post('/admin/update/:id', upload.single('productImage'), async (req, res) => {
  try {
    // Extracting data from the form
    const updateData = {
      productName: req.body.productName,
      productCategory: req.body.productCategory,
      productDescription: req.body.productDescription,
      productPrice: req.body.productPrice,
      productQuantity: req.body.productQuantity,
    };

    // Check if a file is uploaded
    if (req.file) {
      updateData.productImage = req.file.filename; // Save the image path
    }

    // Update the product in the database
    const product = await productModel.findOneAndUpdate(
      { _id: req.params.id }, // Filter
      updateData,             // Updated fields
      { new: true }           // Return the updated document
    );

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.redirect('/admin'); // Redirect after successful update
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/admin/signin',(req,res)=>{
  res.render('admin-signin');
});
app.get('/admin/signup',(req,res)=>{
  res.render('admin-signup');
});
app.get('/admin/signout',(req,res)=>{
  res.cookie("atoken", "");
    res.redirect('/admin');
});

app.post("/admin/signup", async (req, res) => {
  let { username,email,password} = req.body;
  let user = await userModel.findOne({ email });
  console.log(username);
  
  if (user) return res.status(500).send("User is already register");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let admin = await adminModel.create({
        username,
        
        email,
        password: hash,
      });
      let atoken = jwt.sign({ email: email, adminid: admin._id }, "shhhh");
      res.cookie("atoken", atoken);
      res.redirect('/admin');
    });
  });
});

app.post('/admin/login',async (req,res)=>{
  let { email, password } = req.body;
  let admin = await adminModel.findOne({ email });
  if (!admin) return res.status(500).send("Somthing went wrong");
  bcrypt.compare(password, admin.password, (err, result) => {
    if (result) {
      let atoken = jwt.sign({ email: email, adminid: admin._id }, "shhhh");
      res.cookie("atoken", atoken);
      res.redirect("/admin");
    } else return res.send("somethingis worng");
  });
});

app.get('/admin/order', async (req, res) => {
  try {
    // Fetch all orders and populate the "userid" field
    const orders = await checkoutModel.find().populate({
      path: "userid",
     select: "username cart",
    });
    //res.json(orders);
    
    
     res.render("manageOrder",{orders}) // Send populated orders as JSON
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/admin/update-order', async (req, res) => {
  try {
      const { userid, status } = req.body;
      await checkoutModel.findByIdAndUpdate(userid, { status });

      res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating order' });
  }
});
app.post('/admin/cancel-order', async (req, res) => {
  try {
      const { userid } = req.body;
      await checkoutModel.findByIdAndUpdate(userid, { status: 'Cancelled' });

      res.json({ success: true, message: 'Order cancelled' });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Error cancelling order' });
  }
});

//Middleware for admin  

function adminLoggedIn(req,res,next) {
  if (req.cookies.atoken === "") res.redirect("/admin/signin");
    else {
      let data = jwt.verify(req.cookies.atoken, "shhhh");
  
      req.admin = data;
      next();
    }
}
const port = 4000;

app.listen(port, () => {
  
    console.log('Server is running  ');
});
