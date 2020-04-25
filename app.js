require('dotenv').config()
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");
const app=express();
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology:true});

const userSchema=new mongoose.Schema({
    username:String,
    password:String
});
userSchema.plugin(encrypt,{secret:secret,encryptedFields:["password"]});
const User=mongoose.model("User",userSchema);

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });
    user.save(function(err){
        if(err){
            console.log(err);
        }
        else
        {
            res.render("secrets");
        }
    })
});
app.post("/login",function(req,res){
    User.findOne({username:req.body.username},function(err,result){
        if(!err){
            if(result){
                if(result.password===req.body.password){
                    res.render("secrets");
                }
            }
        }
    })
});

app.listen(3000,function(req,res){
    console.log("Port started and lsitenning at 3000");
})
