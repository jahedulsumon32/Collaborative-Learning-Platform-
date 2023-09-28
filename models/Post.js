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
date:{
    type:Date,
    default:Date.now
}
},
{timestamp:true
});
const Post=mongoose.model('Post',PostSchema);
module.exports=Post;