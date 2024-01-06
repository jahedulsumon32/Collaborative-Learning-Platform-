const express=require('express')
const router=express.Router();
const {ensureAuthenticated}=require('../config/auth');

router.get('/login',(req,res)=>{
    res.render('login',{user:req.user});
});
router.get('/welcome',(req,res)=>res.redirect('/users/welcome'));
router.get('/dashboards', ensureAuthenticated,(req, res,next)=>{
  res.render('dashboards',{user:req.user})
 // console.log(req.user);
});

router.get('/profile',(req,res)=>res.render('profile',{user:req.user}));

router.get('/post',ensureAuthenticated,(req,res,next)=>{

  res.render('post',{user:req.user});
})
router.get('/eachPost/:id',ensureAuthenticated,(req,res,next)=>{
  console.log(req.path)
  res.redirect(`/users/eachPost/${req.params.id}`);
})
router.get('/chat', ensureAuthenticated,(req, res) => {
    res.render('chat',{user:req.user})
  });


module.exports=router;