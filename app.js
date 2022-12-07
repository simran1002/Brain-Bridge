const cookieParser = require('cookie-parser');
const express = require('express')
const passport = require('passport')
const app = express()
const PORT = process.env.PORT || 5000;


app.set("view engine","ejs");
app.use(express.json());
app.use(cookieParser());


app.get('/',(req,res) => {
    res.render("pages/index")
})

app.get('/login',(req,res) => {
    res.render('login');
})

app.post('/login',(req,res) => {
    let token = req.body.token;

    console.log(token);
})

app.listen(PORT,() => {
    console.log(`App is running at Port ${PORT}`);
})