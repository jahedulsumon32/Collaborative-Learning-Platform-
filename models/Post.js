const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: String,
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
postSchema.statics.paginatePosts = async function (page = 1, limit = 3) {
  const skip = (page - 1) * limit;

  const posts = await this.find()
    .sort({ date: -1 }) // Sorting by date in descending order (most recent first)
    .skip(skip)
    .limit(limit)
    .populate("user", "name email image"); // Populate the 'user' field with 'name' and 'email and image'

  return posts;
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
