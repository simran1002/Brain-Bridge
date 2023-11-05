const mongoose = require("mongoose");
const jwt=require("jsonwebtoken");

const gameSchema = new mongoose.Schema({
    gameName:  {
        type:String,
        required: true
    },
    date:  {
        type:String,
        required: true,
        unique:true
    },
    score:  {
        type:String,
        required: true
    }
})

const Games = new mongoose.model("games", gameSchema);

module.exports= Games;









