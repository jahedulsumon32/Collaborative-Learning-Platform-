
const express=require('express')
const router=express.Router();
const passport=require('passport')
const bcrypt=require('bcrypt')
const emailValidator = require('deep-email-validator');


// load user model
const User=require('../models/User');
const Post=require('../models/Post');
const Like=require('../models/Like')
const { ObjectID } = require('mongodb');
// Login page
router.get('/login',checkNotauthenticated,(req,res)=>res.render('login'));
// register page
router.get('/register',checkNotauthenticated,(req,res)=>res.render('register'));
router.get('/welcome',checkauthenticated,async(req,res)=>{
    try {
        const posts = await Post.find();
        // Creating an array to store post data with like and dislike counts
         const postData = [];
       // Loop through each post and fetch like and dislike counts
    for (const post of posts) {
        const likeCount = await Like.count({ post_id: post._id, type: 1 });
        const dislikeCount = await Like.count({ post_id: post._id, type: 0 });
  
        // Push post data with counts to the array
        postData.push({
          post: post,
          likeCount: likeCount,
          dislikeCount: dislikeCount,
        });
        req.app.locals.io.emit('updateLikes', { postId: post._id, likeCount: likeCount });
        req.app.locals.io.emit('updateDislikes', { postId: post._id, dislikeCount: dislikeCount });
    }
        // Rendering the welcome page with post data
    res.render('welcome', { user: req.user, postData: postData });
     
     } catch (error) {
        console.log(error)
        res.status(500).send('Error fetching posts');
      
    }
});

//post_page
router.get('/post',(req,res)=>{
    res.render('post',{user:req.user});
});

router.get('/eachPost/:id',checkauthenticated,async(req,res,next)=>{
    try {
        const id=req.params.id
        const likes = await Like.find({ "post_id":req.params.id,type:1 }).count();
        const dislikes = await Like.find({ "post_id":req.params.id,type:0 }).count();

        const post = await Post.findOne({ "_id":req.params.id });

        res.render('eachPost',{user:req.user,post:post,likes:likes,dislikes:dislikes});
        
    } catch (error) {
        console.log(error.message);
    }
})
router.post('/add-comment',async(req,res)=>{
    try {
        
        var post_id = req.body.post_id;
        var username = req.body.username;
        var email = req.body.email;
        var comment = req.body.comment;

        var comment_id = new ObjectID();

        await Post.findByIdAndUpdate({ _id:post_id },{
            $push:{
                "comments":{_id:comment_id, username:username,email:email, comment:comment }
            }
        });

        res.status(200).send({ success:true,msg:'Comment added!', _id:comment_id });

    } catch (error) {
        res.status(200).send({ success:false,msg:error.message });
    }
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
router.post('/post/:id/comment', async (req, res) => {
    // find out which post you are commenting
     const id = req.params.id;
    // get the comment text and record post id
     const comment = new Comment({
     text: req.body.comment,
     post: id
  })
    // save comment
 await comment.save();
    // get this particular post
 const postRelated = await Post.findById(id);
    // push the comment into the post.comments array
 postRelated.comments.push(comment);
    // save and redirect...
 await postRelated.save(function(err) {
 if(err) {console.log(err)}
 res.redirect('/')
 })

})

router.post('/login',checkNotauthenticated,(req,res,next)=>{
        passport.authenticate('local',{
            successRedirect: ('/welcome'),
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