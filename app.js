const cookieParser = require('cookie-parser');

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const userModel = require('./model/user');
const adminModel = require("./model/adminModel.js");

const path = require('path');
const productModel = require('./model/products');
const upload = require('./config/multerconfig.js');


// Middleware setup
app.use(express.urlencoded({ extended: true }));  // For form data
app.use(express.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'config')));
app.set('view engine', 'ejs');

// Route to render the index page
app.get('/', async (req, res) => { 
  
  try {
    let products = await productModel.find();

    const electronics = products.filter(product => product.productCategory === "electronics");
    const feature = products.filter(product => product.productCategory === "feature");
    const homeandliving = products.filter(product => product.productCategory === "homeandliving");
    const sports = products.filter(product => product.productCategory === "sports");
    const fashion = products.filter(product => product.productCategory === "fashion");

    res.render('index', { 
      electronics, 
      feature, 
      homeandliving, 
      sports, 
      fashion 
    });
    
    
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/cart', (req, res) => {
    res.render('cart');
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
app.get('/profile', isLoggedIn,async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
    res.render('profile',{user});
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
  res.cookie("token", "");
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
      let token = jwt.sign({ email: email, adminid: admin._id }, "shhhh");
      res.cookie("token", token);
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
      let token = jwt.sign({ email: email, adminid: admin._id }, "shhhh");
      res.cookie("token", token);
      res.redirect("/admin");
    } else return res.send("somethingis worng");
  });
});

//Middleware for admin

function adminLoggedIn(req,res,next) {
  if (req.cookies.token === "") res.redirect("/admin/signin");
    else {
      let data = jwt.verify(req.cookies.token, "shhhh");
  
      req.admin = data;
      next();
    }
}


app.listen(3000, () => {
  
    console.log('Server is running on port 3000');
});
