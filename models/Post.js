const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["Academic", "Non-Academic", "Other"], // Add more as needed
    },
    title: {
      type: String,
      required: true,
    },
    desc: String, // Store Quill-generated HTML here
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // a blog post can have multiple comments, so it should be in a array.
    // all comments info should be kept in this array of this blog post.
    comments: {
      type: Object,
      default: {},
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Add a static method to the Post model for pagination

postSchema.statics.paginatePosts = async function (
  page = 1,
  limit = 3,
  category
) {
  const skip = (page - 1) * limit;

  const query = category ? { category } : {}; // Use category filter if provided

  const posts = await this.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "name email image");

  return posts;
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
