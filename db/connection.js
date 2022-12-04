const express=require("express");
const mongoose=require("mongoose");
const app=express();

mongoose.connect("mongodb+srv://newcluster:Simran10@newcluster.3c8d49a.mongodb.net/?retryWrites=true&w=majority",{
  useNewUrlParser:true,
  useUnifiedTopology:true
}).then(()=>{
  console.log("connection is successful");
}).catch((e)=>{
  console.log(e)
  console.log("no connection");
})

const fruitSchema = new mongoose.Schema({
  name:String,
  rating:Number,
  review:String
});

const Fruit=mongoose.model("Fruit",fruitSchema);

const fruit=new Fruit({
  name:"Apple",
  rating:7,
  review:"pretty solid as a fruit"
});

fruit.save();

app.listen(80,function(){
  console.log("server has started");
});