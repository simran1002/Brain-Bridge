require("dotenv").config();

const nodemailer = require("nodemailer");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");
const { nextTick } = require("process");
const jwt=require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 8000
const User = require("./source/model/schema");
const { response } = require("express");
const Games = require("./source/model/games");
require("./source/db/connection");
const app = express()
app.use(express.json());
app.use(cors());


const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());


app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.JWT_Key // Replace with your actual secret key
}));
 []

app.post('/register',async (req, res) => {
  try {
    const { name, email, gender, age,password, phoneNumber } = req.body;

    // Validate the input data (add more validation as needed)
    if (!name || !email || !gender || !age || !password || !phoneNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the user already exists (e.g., based on email or AadharNumber)
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(409).json({ error: 'User with the same email or phoneNumber already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const Schema = new User({ name, email,gender, password: hashedPassword, age , phoneNumber});
    await Schema.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
      console.error('User registration error:', error);
    };
  });


  function generateToken(user) {
    const payload = { userId: user._id, email: User.email };
    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1h' });
    return token;
  }
  
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("Login Done");
    try {
      const UserID = await User.findOne({ email });
      console.log("login user id->",UserID);
      if (!UserID) {
        return res.status(401).json({ message: 'Login Successfully not' });
      }
  
      console.log("password->",password);
      console.log("userhased password=>",UserID.password);
      const passwordMatch = await bcrypt.compare(password, UserID.password);
      console.log("password match->",passwordMatch);
      if (!passwordMatch) {
        const err = new Error('Enter the correct password');
        err.status = 401;
        throw err;
      };
  
      const token = generateToken(UserID);
      console.log("token->",token);
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// Route to verify OTP
app.post('/verifyotp', async (req, res) => {
  const { email } = req.body;
  const { enteredOTP } = req.body;

  try {
    // Retrieve the stored OTP data using Mongoose
    const otp_Data = await otpData.findOne({ email });
    console.log(otp_Data);

    if (!otp_Data) {
      return res.status(400).json({ message: 'OTP not found' });
    }

    // Check if the OTP has expired
    if (Date.now() > otp_Data.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (enteredOTP === otp_Data.OTP) {
      // If the OTP is verified, you should delete the OTP record from the database
      await otp_Data.deleteOne({ email });
      res.status(200).json({ message: 'Your OTP verified successfully' });
    } else {
      res.status(401).json({ message: 'OTP verified successfully' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// app.get("/google",passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get("/google/callback",passport.authenticate("google", { failureRedirect: "/failed" }),
//     function(req,res){
//       if (req.user.email.match(/[A-Za-z0-9]+@akgec\.ac\.in/g)) {
//         res.redirect("/success");
//       } else {
//         res.send("Login using college email only")
//       }
//     }  
// );

// app.get('/success',(req,res) => {
//   if(req.isAuthenticated()) {
//     const userDetails = {
//       email: req.user.email,
//       name: req.user.name.givenName + " " + req.user.name.familyName,
//       profileURL: req.user.picture
//     }
//     res.render("pages/register", {userDetailsNew: userDetails})
//   } else {
//     res.redirect("/")
//   }   
// })

async function sendEmail(toAddress) {
  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "simranyadav464@gmail.com",
        clientId:"277985285628-560of7ar2drp5dl57go9sphegm3int6n.apps.googleusercontent.com",
        clientSecret:"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",
        accessToken:"ya29.a0AeTM1idxo4cAJu5Ya2NVKS2Hd-W0YoIAfshLKVa3ixpQLxhiOr9Va5sac5RmAAN6NTZNCtdbj6nfsKtb17_R0LNoz7UgUi5RXHfhpiwNly9EttmHDWa6_FRCOarR0Ck95MktbR_AweboT8XEo0jJDvgaV1v5aCgYKARcSARASFQHWtWOmTRP864ErVtgJUIJIwf47AA0163"
      },
    });
 
    const mailOptions = {
        from:"simranyadav464@gmail.com",
        to: toAddress,
        subject:"This is the confirmation email",
        text:"Hello this is the body of the email",
        html:"<h1>Successfully registered for HASHEZ </h1>"
    }
 
    const result = await transport.sendMail(mailOptions)
 
    return result
 
  } catch (error) {
    console.log(error);
  }
}

// app.post("/add/registered/user",async (req,res,next)=>{
//   console.log(req.body)
    
  
//   try {
//     const userExist=await schema.findOne({email:req.body.email});
    
//     if(!userExist){
//       const registerUser=new schema({
//         email:req.body.email,
//         name:req.body.name,
//       })
//       const userData=await registerUser.save();
//        const token= await registerUser.generateAuthtoken();
//       res.cookie("email",token);
//       console.log(userData);
//       console.log("registered Successfully");
//     }
//     else if(userExist.payment_status==true){
      
//       res.redirect("/success");
//     }
//     else{
//       console.log("User Already Exists")
//       const token= await userExist.generateAuthtoken();
//       res.cookie("email",token);
//     }
    
//   } catch (e) {
//     console.log(e);
//     res.status(400).json({message:"Details missing"});
//   }
// })

  
 


app.listen(PORT,() => {
    console.log(`Server is running at Port ${PORT}`);
});