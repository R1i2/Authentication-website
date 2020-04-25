// require('dotenv').config()
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
// const encrypt=require("mongoose-encryption");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const app=express();
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology:true});
// mongoose.set({useCreateIndex:true});
// const md5=require("md5");
// const bcrypt=require("bcrypt");

// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(session({
    secret:"ThisismylittleSecret",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

const userSchema=new mongoose.Schema({
    username:String,
    password:String,
    secrets:String
});
userSchema.plugin(passportLocalMongoose);

const User=mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    User.find({"secrets":{$ne:null}},function(err,foundUsers){
        if(err){
            console.log(err);
        }
        else{
            if(foundUsers){
            res.render("secrets",{userWithSecrets:foundUsers});
        }
    }
});
});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});
app.get("/submit",function(req,res){
    if(req.isAuthenticated()){
        res.render("submit");
    }
    else{
        res.redirect("/login");
    }
});
app.post("/register",function(req,res){
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login",function(req,res){
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});
app.post("/submit",function(req,res){
    const submittedSecret=req.body.secret;
    User.findById(req.user.id,function(err,foundUsers){
        if(err){
            console.log(err);
        }
        else{
            if(foundUsers){
                foundUsers.secrets=submittedSecret;
                foundUsers.save(function(){
                    res.redirect("/secrets");
                });
            }
        }
    });
});
app.listen(3000,function(req,res){
    console.log("Port started and lsitenning at 3000");
});

// app.post("/register",function(req,res){
//     bcrypt.hash(req.body.password,10,function(err,hash){
//         const user=new User({
//             username:req.body.username,
//             password:hash
//         });
//         user.save(function(err){
//             if(err){
//                 console.log(err);
//             }
//             else
//             {
//                 res.render("secrets");
//             }
//         });
//     });
// });
// app.post("/login",function(req,res){
//     User.findOne({username:req.body.username},function(err,result){
//         if(!err){
//             if(result){
//                 bcrypt.compare(req.body.password,result.password,function(err,response){
//                     if(response===true){res.render("secrets");}
//                 });
//             }
//         }
//     })
// });