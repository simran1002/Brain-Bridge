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
        required: true
    }
})

userSchema.methods.generateAuthtoken=async function(){
    try {
        console.log(this.email);
        const token=jwt.sign({email:this.email.toString()},"Google");
        return token;
        
    } catch (error) {
        console.log(error);
    }
}

const Schema = new mongoose.model("schema", userSchema);

module.exports= Schema;









