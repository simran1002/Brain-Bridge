const mongoose = require("mongoose");
const jwt=require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    name:  {
        type:String,
        required: true
    },
    email:  {
        type:String,
        required: true,
        unique:true
    },
    gender:  {
        type:String,
        required: true
    },
    age:  {
        type:String,
        required: true
    },
    password: {
        type:String,
        required: true
    },
    phoneNumber:{
        type:String,
        required: true,
        unique: true
    }
})

const Schema = new mongoose.model("user", userSchema);

module.exports= Schema;









