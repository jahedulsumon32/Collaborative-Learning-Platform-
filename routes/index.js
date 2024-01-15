/*const express=require('express')
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

router.get('/about',(req,res)=>res.render('about',{user:req.user}));

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
*/

const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const Post = require("../models/Post");

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

router.get("/welcome", ensureAuthenticated, async (req, res) => {
  const currentPage = req.query.page || 1;
  const postsPerPage = 2; // Adjust as needed

  try {
    const paginatedPosts = await Post.paginatePosts(currentPage, postsPerPage);

    // Calculate total pages dynamically based on the total number of posts and posts per page
    const totalPosts = await Post.countDocuments({});
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    res.render("welcome", {
      user: req.user,
      paginatedPosts,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching posts");
  }
});



router.get("/dashboards", ensureAuthenticated, async (req, res, next) => {
  res.render("dashboards", { user: req.user });
});

router.get("/profile", (req, res) => res.render("profile", { user: req.user }));

router.get("/about", (req, res) => res.render("about", { user: req.user }));

router.get("/post", ensureAuthenticated, (req, res, next) => {
  res.render("post", { user: req.user });
});

router.get("/eachPost/:id", ensureAuthenticated, (req, res, next) => {
  console.log(req.path);
  res.redirect(`/users/eachPost/${req.params.id}`);
});

router.get("/chat", ensureAuthenticated, (req, res) => {
  res.render("chat", { user: req.user });
});

module.exports = router;
