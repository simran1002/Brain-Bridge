require("dotenv").config();

const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();
const cors = require("cors");
const otpGenerator = require('otp-generator');
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

app.post('/sendverificationemail', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'User with the same email already exists' });
    }

    // Generate a random OTP
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const OTPEntry = new OTPModel({ email, OTP: otp });
    await OTPEntry.save();

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'OTP verification code for your email',
      text: `Your OTP for email verification is: ${otp}`,
    };

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send email with the OTP
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: 'Error sending verification email' });
      }
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'Verification email sent successfully' });
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP and save user data
app.post('/verifyemailandregister', async (req, res) => {
  try {
    const { email, enteredOTP, name, gender, age, password, phoneNumber } = req.body;

    // Retrieve the stored OTP data using Mongoose
    const otpData = await OTPModel.findOne({ email });

    if (!otpData) {
      return res.status(400).json({ message: 'OTP not found' });
    }

    // Check if the OTP has expired
    if (Date.now() > otpData.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (enteredOTP === otpData.OTP) {
      // If the OTP is verified, you should delete the OTP record from the database
      await otpData.deleteOne({ email });

      // Check if the user already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({ error: 'User with the same email already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 8);

      // Create a new user instance
      const newUser = new User({ name, email, gender, password: hashedPassword, age, phoneNumber });

      // Save the new user to the database
      await newUser.save();

      res.status(200).json({ message: 'Your email is verified and user registered successfully' });
    } else {
      res.status(401).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error verifying email and saving user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

 
function generateToken(user) {
  const payload = { userId: user._id, email: user.email }; // Use user.email instead of User.email
  const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1h' });
  return token;
}

//user login details
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const UserID = await User.findOne({ email });
    if (!UserID) {
      return res.status(401).json({ message: 'Login Successfully not' });
    }

    const passwordMatch = await bcrypt.compare(password, UserID.password);
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


app.listen(PORT,() => {
    console.log(`Server is running at Port ${PORT}`);
});