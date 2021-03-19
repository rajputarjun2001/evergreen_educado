// ======================REQUIRED=========================
require("dotenv").config();
var express = require("express"),
	app = express(),
	bodyparser = require("body-parser"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	localStrategy = require("passport-local"),
	Cat = require("./models/cat"),
	Contact = require("./models/contact"),
	Comment = require("./models/reviews"),
	User = require("./models/user"),
	methodOverride = require("method-override");

//=====================APP CONFIG==========================

app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));
mongoose.connect("mongodb://localhost:27017/random", {useNewUrlParser : true, useUnifiedTopology : true});
app.use(methodOverride("_method"));


//PASSPORT CONFIG

app.use(require("express-session")({
	secret : "Its all in the mind",
	resave : false,
	saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
});

//middlewares

let middlewareObj = {}; 
middlewareObj.isAdmin = function(req,res,next){
	if(req.user && req.user.username===process.env.ADMIN){
		next();
	}
	else{
		res.redirect("back");
	}
}


// ===================ROUTES===============================

app.get("/",function(req,res){
	res.render("index");
});

// --------------------CAT--------------------------------

app.get("/cat",function(req,res){
	Cat.find({},function(err,cat){
		if(err)
			console.log(err)
		else
		res.render("cat/index",{cat: cat});	
	});
});

app.get("/cat/new",middlewareObj.isAdmin,function(req,res){
	res.render("cat/new");
});
	
app.post("/cat",middlewareObj.isAdmin,function(req,res){
	Cat.create(req.body.cat,function(err,newCatBook){
		if(err)
			console.log(err)
		else
			res.redirect("/cat");
	});
});

app.get("/cat/:id/edit",middlewareObj.isAdmin,function(req,res){
	Cat.findById(req.params.id,function(err,updateBook){
		if(err)
			console.log(err);
		else
			res.render("cat/edit",{cat:updateBook});
	});
});

app.put("/cat/:id",middlewareObj.isAdmin,function(req,res){
	Cat.findByIdAndUpdate(req.params.id,req.body.cat,function(err,updatedBook){
		if(err)
			console.log(err)
		else
			res.redirect("/cat/"+req.params.id);
	});
});

app.get("/cat/:id/delete",middlewareObj.isAdmin,function(req,res){
	Cat.findByIdAndDelete(req.params.id,function(err){
		if(err)
			console.log("Didnt delete",err)
		else
			res.redirect("/cat")
	});
});

app.get("/cat/:id",function(req,res){
	Cat.findById(req.params.id).populate("comments").exec(function(err,book){
		if(err)
			console.log(err);
		else
			res.render("cat/show",{book:book});
	});
});

app.get("/cat/:id/comments/new",function(req,res){
	Cat.findById(req.params.id,function(err,book){
		if(err)
			console.log(err)
		else
			res.render("comments/cat/new",{book : book});
	});
});

app.post("/cat/:id/comments",function(req,res){
	Cat.findById(req.params.id,function(err,book){
		if(err){
			console.log(err);
			res.redirect("/cat")
		}
		else{
			Comment.create(req.body.comment,function(err,comment){
				if(err)
					console.log(err)
				else
					book.comments.push(comment);
					book.save();
					res.redirect("/cat/" + book._id);
			});
		}
	});
});

app.delete("/cat/:id/comments/:comment_id",middlewareObj.isAdmin,function(req,res){
	Cat.findById(req.params.id,function(err,book){
		if(err)
			console.log(err)
		else{
			Comment.findByIdAndRemove(req.params.comment_id,function(err){
				if(err)
					console.log(err)
				else{
					res.redirect("/cat/"+req.params.id);
				}
			});
		}
	});
});

// ---------------------------------

app.get("/jee-mains",function(req,res){
	res.render("jee/index");	
});

app.get("/gate-categories",function(req,res){
	res.render("gate/index");	
});

app.get("/gate-cse",function(req,res){
	res.render("gate/cse/index");	
});

app.get("/gate-electrical",function(req,res){
	res.render("gate/electrical/index");	
});

app.get("/gate-electronics",function(req,res){
	res.render("gate/electronics/index");	
});

app.get("/gate-mechanical",function(req,res){
	res.render("gate/mechanical/index");	
});

app.get("/gate-civil",function(req,res){
	res.render("gate/civil/index");	
});

app.get("/clat",function(req,res){
	res.render("clat/index");	
});

app.get("/neet",function(req,res){
	res.render("neet/index");	
});

app.get("/nda",function(req,res){
	res.render("nda/index");	
});

app.get("/about-us",function(req,res){
	res.render("about/index");	
});

// ------------------Contact-------------------------------------

app.get("/contact-us",function(req,res){
	res.render("contact/index");	
});

app.post("/contact-us",function(req,res){
	var firstName = req.body.contact.firstName;
	var lastName = req.body.contact.lastName;
	var email = req.body.contact.email;
	var mobile = req.body.contact.mobile;
	var message = req.body.contact.message;
	var newMessage = {firstName:firstName, lastName : lastName, email:email, mobile:mobile,message:message};
	Contact.create(newMessage,function(err,newMessage){
		if(err){
			console.log(err)
		}
		else{
			res.redirect("/contact-us");
		}
	});
});


//AUTH routes

app.get("/login",function(req,res){
	res.render("login");
});
app.post("/login",passport.authenticate("local",{
		successRedirect : "/",
		failureRedirect : "/login"
	}) ,function(req,res){
});

app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register",function(req,res){
	let newUser = new User({username : req.body.username});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err)
			return res.render("register");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/");
		});
	});
});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});

//===========================RUNNING PORT===========================

app.listen(process.env.PORT || 3000,function(){
	console.log("Server listening on port 3000!");
});
