const express=require('express')
const router=express.Router();
const {ensureAuthenticated}=require('../config/auth');

router.get('/',(req,res)=>{
    res.render('login',{user:req.user});
});
router.get('/welcome',(req,res)=>res.redirect('/users/welcome'));
router.get('/dashboards', ensureAuthenticated,(req, res,next)=>{res.render('dashboards',{user:req.user})});

router.get('/profile',(req,res)=>res.render('profile',{user:req.user}));

router.get('/post',ensureAuthenticated,(req,res,next)=>res.render('post',{user:req.user}));
router.get('/chat', ensureAuthenticated,(req, res) => {
    res.render('chat',{user:req.user})
  });


module.exports=router;