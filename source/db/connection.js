const mongoose=require("mongoose");


mongoose.connect("mongodb+srv://simran1002:Simran10@newcluster.3c8d49a.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("connection is successful");
}).catch((e)=>{
    console.log(e);
    console.log("no connection");
})

const userSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    required: true,
    unique: true
  },
  password:String,

});

exports:User = mongoose.model("User", userSchema);