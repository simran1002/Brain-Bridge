require('dotenv').config()

const cookieParser = require('cookie-parser');
const path = require("path");
const express = require('express')
const passport = require('passport')
const app = express()
const PORT = process.env.PORT || 5000
const session = require('express-session');
const schema = require("./source/model/schema");
require("./passport-setup");
require("./source/db/connection");

const static_path = path.join((__dirname, "./views/pages"))
 app.use(express.static(static_path ))


 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
let userRouter = express.Router()
app.use('/user',userRouter)


userRouter
.route('/')
.post(createUser)
let users={};
async function createUser(req,res,next){
    let user=req.body;
    users=user
    let data = await userModel.create(user)
    res.json({
        message:"data created successfully",
        user:user
    })
    console.log("user created")
        // next();
}

app.use(session({
 resave: false,
 saveUninitialized: true,
  secret: 'bla bla bla' 
  }));
//google auth
const {OAuth2Client} = require('google-auth-library');
const { Passport } = require('passport');
const { Router } = require('express');
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
      res.redirect("/success");
     // res.send("success")
    }  
);


app.post("/register", async (req, res) => {
    try {
      {
        const registerUser = new schema({
          email: req.body.remail,
          name: req.body.name,
          profileurl: req.body.profileurl,
          branch: req.body.branch,
          year: req.body.year,
          student_number: req.body.student_number,
          roll_number: req.body.roll_number
        });
        res.json
        ({
            message:"passwords are not matching"
        });
        const userdata = await registerUser.save();

        // console.log("the success part"+registerUser);
  
        //------------------------------- middelware------------
        // const token = await registerUser.generateAuthToken();
        // console.log(`the token is`+token);
        //------------------------------- middelware------------
  
        // the res.cookie() function is used to set the cookie name with a value
        // the value parameter may be a string or object converted in json
  
        // syntax:
        // res.cookie(name,value,[options]);
  
        // res.cookie("autherizationcookie", token, {
        //   expires: new Date(Date.now() + 300000),
        //   httpOnly: true,
        // });
  
        // const userdata = await registerUser.save();
        // // console.log(userdata);
        // res.status(201).render("index");
    //   } else {
    //     res.send("passwords are not matching");
      }
    } catch (e) {
      res.status(400).send(e);
      console.log(e);
    }
  });

// router.post('/register',(req, res) => {

//     const {name,email,phone,work,password,cpasswod} = req.body;
// });
app.listen(PORT,() => {
    console.log(`App is running at Port ${PORT}`);
})