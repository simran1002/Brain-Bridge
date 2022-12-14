const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name:  {
        type:String,
        required: true
    },
    email:  {
        type:String,
        required: true,
        unique:true
    },
    profileurl:  {
        type:String,
        required: true
    },
    branch:  {
        type:String,
        required: true
    },
    year:  {
        type:Number,
        required: true
    },
    student_number:  {
        type:Number,
        required: true,
        unique: true
    },
    roll_number:  {
        type:Number,
        required: true,
        unique: true
    }

})

const Schema = new mongoose.model("schema", studentSchema);

module.exports= Schema;