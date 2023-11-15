const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  OTP: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // You can add other fields as needed, such as expiration time, attempts, etc.
});

const otpData = mongoose.model('OTP', otpSchema);

module.exports = otpData;
