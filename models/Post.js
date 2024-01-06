const mongoose=require('mongoose');
const PostSchema=new mongoose.Schema({
    title:{
        type:String,required:true
},
desc:{
    type:String,
},
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
 // a blog post can have multiple comments, so it should be in a array.
         // all comments info should be kept in this array of this blog post.
         comments:{
            type:Object,
            default:{}
        },
date:{
    type:Date,
    default:Date.now
}
},
{timestamp:true
});
const Post=mongoose.model('Post',PostSchema);
module.exports=Post;