require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");
const passport = require("passport");
const cookieSession = require("cookie-session");
const Razorpay = require("razorpay");
const cors = require("cors");
const { nextTick } = require("process");
const { updateMany, updateOne, update } = require("./source/model/schema");
const transpoter=require("./source/model/email");
const jwt=require("jsonwebtoken");
const cookieParser=require("cookie-parser");
const app = express()
const PORT = process.env.PORT || 5000
const session = require("express-session");
const schema = require("./source/model/schema");
require("./source/db/connection");



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());


app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'bla bla bla' 
}));

const views_path = path.join(__dirname,  "./views/pages");
const static_path = path.join(__dirname, "/public");
app.use(express.static(static_path ))
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
//app.set("views", views_path);

require("./passport-setup");

// app.use(
//   cookieSession({
//     name: "interactive-session",
//     keys: ["key1", "key2"],
//   })
// );
// Authentication configuration

// After you declare "app"
// app.use(session({ secret: 'melody hensley is my spirit animal' }));
//google auth
// const {OAuth2Client} = require('google-auth-library');
// const { Passport } = require('passport');
// const { Router } = require('express');
// const CLIENT_ID = '277985285628-560of7ar2drp5dl57go9sphegm3int6n.apps.googleusercontent.com'
// const client = new OAuth2Client(CLIENT_ID);


app.get('/',(req,res)=> {
      
    res.render("pages/index")
})

app.get('/pages/login',(req,res) => {
    res.render('pages/login');
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

function loggedIn(req, res, next) {
  if (req.user) {
      next();
  } else {
      res.redirect('/google');
  }
}

// app.get("/test", )


app.post("/add/registered/user",async (req,res,next)=>{
  console.log(req.body)
  console.log(req.body.email)
  try {
    const userExist=await schema.findOne({email:req.body.email});
    
    if(!userExist){
      const registerUser=new schema({
        email:req.body.email,
        name:req.body.userName,
        profileurl:req.body.pictureURL,
        branch:req.body.branch,
        year:req.body.year,
        student_number:req.body.student_number,
        roll_number:req.body.student_roll
      })
      const userData=await registerUser.save();
       const token= await registerUser.generateAuthtoken();
      res.cookie("email",token);
      console.log(userData);
      console.log("registered Successfully");
      
      let info=await transpoter.sendMail({
        from:process.env.EMAIL_FROM,
        to:[req.body.email,`${process.env.EMAIL_USER}`],
        subject:"Registered Successfully",
        html:`email:${req.body.email} <br>
        userName:${req.body.uname}, <br>
        pictureURL:${req.body.pname}, <br>
        branch:${req.body.bname}, <br>
        year:${req.body.yname}, <br>
        student_number:${req.body.sno},<br>
        roll_number:${req.body.srno},<br>`,
      })
      console.log("email send");
      res.redirect("/payment");
    }
    else if(userExist.payment_status==true){
      res.redirect("/success");
    }
    else{
      console.log("User Already Exists")
      const token= await userExist.generateAuthtoken();
      res.cookie("email",token);
      res.redirect("/payment");
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({message:"Details missing"});
  }


})

app.get("/payment",loggedIn,(req,res,next)=>{
  try {
    res.render("payment",{
      email:req.body.email,
    });
  } catch (error) {
    console.log(error);
  }
})

app.post("/payments",loggedIn, async (req, res,next) => {
  try {
    let instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    let order = await instance.orders.create({
      amount: 1000,
      currency: "INR",
    });
    res.status(201).json({ success: true, order });
  } catch (e) {
    console.log(e);
  }
});

app.post("/paymentverification",loggedIn,async (req,res,next)=>{

  verifyytoken=req.cookies.email;
  const userver=await jwt.verify(verifyytoken,"done");

  const update_details=userver.email;


    const paymentID=req.body.razorpay_payment_id;
    const orderID=req.body.razorpay_order_id;
    const signatureID=req.body.razorpay_signature;

    let body =orderID +"|" +paymentID;

  let crypto = require("crypto");
  let expectedSignature = crypto.createHmac("sha256", process.env.KEY_SECRET).update(body.toString()).digest("hex");
  console.log("sign received ", signatureID);
  console.log("sign generated ", expectedSignature);
  var response = " Signature is false" ;
  if (expectedSignature === signatureID){
    const newdata=await Register.updateOne({email:update_details},{
      payment_status:"true",
      order_id:orderID,
      payment_id:paymentID,
    });

    let info=await transpoter.sendMail({
      from:process.env.EMAIL_FROM,
      to:[update_details,`${process.env.EMAIL_USER}`],
      subject:"Payment Successfull",
      html:"<h1>Payment Successfull</h1>"
    })
    res.redirect("/success");
  }else{
    res.status(404).json({message:"Payment failed"});
  }
});



app.get("/success",(req,res)=>{
  try {

    res.render("payment successfull");

    
  } catch (error) {
    res.statusCode(400).json({mesaage:"something went wrong"});
  }
})




app.listen(PORT,() => {
    console.log(`App is running at Port ${PORT}`);
})