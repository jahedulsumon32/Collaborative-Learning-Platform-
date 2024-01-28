const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const Post = require("../models/Post");

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});
router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/welcome", ensureAuthenticated, async (req, res) => {
  const currentPage = req.query.page || 1;
  const postsPerPage = 6; // Adjust as needed

  try {
    const categories = ["Academic", "Non-Academic", "Other"]; // Define or fetch categories from your data source
    const category = req.query.category;
    const paginatedPosts = await Post.paginatePosts(
      currentPage,
      postsPerPage,
      category
    );

    const totalPosts = await Post.countDocuments(category ? { category } : {});
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    res.render("welcome", {
      user: req.user,
      paginatedPosts,
      currentPage,
      totalPages,
      selectedCategory: category,
      categories: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching posts");
  }
});

//Handling quill
router.post("/post", ensureAuthenticated, async (req, res, next) => {
  const { category, title, desc } = req.body;

  try {
    const newPost = new Post({
      category,
      title,
      desc, // Save Quill-generated HTML
      user: req.user._id,
    });

    await newPost.save();
    res.redirect("/welcome");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating post");
  }
});

router.get("/dashboards", ensureAuthenticated, async (req, res, next) => {
  res.render("dashboards", { user: req.user });
});

router.get("/profile", (req, res) => res.render("profile", { user: req.user }));

router.get("/about", (req, res) => res.render("about", { user: req.user }));

router.get("/post", ensureAuthenticated, (req, res, next) => {
  // Fetch categories from your data source or define them
  const categories = ["Academic", "Non-Academic", "Other"];

  res.render("post", { user: req.user, categories: categories });
});

router.get("/eachPost/:id", ensureAuthenticated, (req, res, next) => {
  console.log(req.path);
  res.redirect(`/users/eachPost/${req.params.id}`);
});

router.get("/chat", ensureAuthenticated, (req, res) => {
  res.redirect("/users/chat");
});

router.get("/editProfile", (req, res) =>
  res.render("editProfile", { user: req.user })
);

router.get("/summary", (req, res) => {
  const fetchedData = req.query.data;
  res.render("summary", { user: req.user, fetchedData });
});

module.exports = router;
