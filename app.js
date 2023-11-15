require("dotenv").config();

const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();
const cors = require("cors");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { nextTick } = require("process");
const jwt=require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 8000
const User = require("./source/model/user");
const OTPModel = require("./source/model/otp");
const { response } = require("express");
const Games = require("./source/model/games");
require("./source/db/connection");
const app = express()
app.use(express.json());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

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

// Function to generate a random OTP
const generateOTP = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

// Function to send OTP via email
const sendOTP = async (email) => {
  // Generate OTP
  const otp = generateOTP();

  // Create a nodemailer transporter using your email service provider's SMTP details
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Replace with your email service provider
    auth: {
      user: 'simrany6387@gmail.com', // Replace with your email
      pass: 'febhitfzmwltjtbk' // Replace with your email password
    }
  });

  // Email configuration
  const mailOptions = {
    from: 'simrany6387@gmail.com', // Replace with your email
    to: email,
    subject: 'Your OTP for verification',
    text: `Your OTP is: ${otp}`
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully');
    return otp;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Example usage
const userEmail = 'recipient@example.com'; // Replace with the recipient's email address
sendOTP(userEmail)
  .then((otp) => {
    console.log('Generated OTP:', otp);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

function generateToken(user) {
    const payload = { userId: user._id, email: user.email }; // Use user.email instead of User.email
    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1h' });
    return token;
}

//user login details
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
    const otp_Data = await OTPModel.findOne({ email });
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


app.listen(PORT,() => {
    console.log(`Server is running at Port ${PORT}`);
});