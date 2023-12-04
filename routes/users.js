
const express=require('express')
const router=express.Router();
const passport=require('passport')
const bcrypt=require('bcrypt')
const emailValidator = require('deep-email-validator');


// load user model
const User=require('../models/User');
const Post=require('../models/Post');
// Login page
router.get('/login',checkNotauthenticated,(req,res)=>res.render('login'));
// register page
router.get('/register',checkNotauthenticated,(req,res)=>res.render('register'));
router.get('/welcome',checkauthenticated,async(req,res)=>{
    try {
        const posts = await Post.find().populate('user', 'name').sort({ timestamp: -1 });
        res.render('welcome', { 'posts':posts,user:req.user});
      } catch (error) {
        console.log(error)
        res.status(500).send('Error fetching posts');
      }
});

//post_page
router.get('/post',(req,res)=>{
    res.render('post',{user:req.user});
});




// register handle
router.post('/register',checkNotauthenticated,async(req,res)=>{

    const{name,email,password,password2}=req.body;
    async function isEmailValid(email) {
        return emailValidator.validate(email)
      }
    let errors=[];
    // check required fields
    const {valid, reason, validators} = await isEmailValid(email);
    if(!valid){
        errors.push({msg:'please provide a correct email.Provided email mailbox is not found'});
    }
    if(!name || !email || !password|| !password2){
        errors.push({msg:'Please filled required field'});
    }
    if(password!=password2){
        errors.push({msg:'Password does not match'})
    }
    if(password.length<6){
        errors.push({msg:'Password must be atleast 6 characters'})
    }

    if(errors.length>0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else{
        User.findOne({email:email}).then(user=>{
            // User exists
            if(user){
            errors.push({msg:"Email is already registered"});
            res.render('register',{
                errors,
                name,
                email,
                password,
                password2
            });
        }
        else{
            const newUser=new User({
                name,
                email,
                password

            });
        //    Hash password
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(newUser.password,salt,(err,hash)=>{
                if(err)throw err
                // Set password to hash
                newUser.password=hash;

                newUser.save().then(user=>{
                    req.flash('success_msg','You are now a registed So you can log in');
                    res.redirect('/users/login');
                }).catch(err=>console.log(err));

        });
    });
        }
       
        });
    }
});
router.post('/post',checkauthenticated,async(req,res,next)=>{
    try {
        const { title, desc } = req.body;
        const newPost = new Post({
        title,
        desc,
        user: req.user._id, // Associate the post with the user's ID
      });
      await newPost.save();
      res.redirect('/welcome');
    } catch (error) {
      res.status(500).send('Error creating post');
    }

    // res.send("post created success")
})

router.post('/login',checkNotauthenticated,(req,res,next)=>{
        passport.authenticate('local',{
            successRedirect: ('/dashboards'),
            failureRedirect: '/users/login',
            failureFlash:true

        })(req,res,next);
});

// Logout handle

router.get('/logout',(req,res)=>{
        req.logout(()=>{});
        req.flash('success_msg','You are logged out')
        res.redirect('/users/login');
});
function checkauthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
function checkNotauthenticated(req,res,next){
    if(req.isAuthenticated()){
       return res.redirect('/')
    }
    next()
}


module.exports=router;