require('dotenv').config()

const cookieParser = require('cookie-parser');
const express = require('express')
const passport = require('passport')
const app = express()
const PORT = process.env.PORT || 5000
const session = require('express-session');
require("./passport-setup");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// After you declare "app"
//app.use(session({ secret: 'melody hensley is my spirit animal' }));
// Authentication configuration
app.use(session({
 resave: false,
 saveUninitialized: true,
  secret: 'bla bla bla' 
  }));
//google auth
const {OAuth2Client} = require('google-auth-library');
const { Passport } = require('passport');
const CLIENT_ID = '277985285628-560of7ar2drp5dl57go9sphegm3int6n.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);


app.set("view engine","ejs");

app.use(passport.initialize())

app.use(passport.session())

app.use(express.json());
app.use(cookieParser());

app.get('/',(req,res)=> {
    res.render("pages/index")
})

app.get('/pages/login',(req,res) => {
    res.render('login');
})

app.get('/success',(req,res) => {
    res.render("pages/register")
})

app.get("/google",passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/google/callback",passport.authenticate("google", { failureRedirect: "/failed" }),
    function(req,res){
      res.redirect("/register");
     // res.send("success")
    }  
);


app.listen(PORT,() => {
    console.log(`App is running at Port ${PORT}`);
})