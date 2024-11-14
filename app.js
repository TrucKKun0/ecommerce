const cookieParser = require('cookie-parser');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const userModel = require('./model/user');
const path = require('path');


// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // For form data
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Route to render the index page
app.get('/', (req, res) => {
    res.render('index');
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
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
