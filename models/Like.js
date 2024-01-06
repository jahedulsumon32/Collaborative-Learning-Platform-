const mongoose = require("mongoose");

const LikeSchema = mongoose.Schema({

    post_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
        required:true
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    type:{
        type:Number,
        required:true
    }

});

const Like = mongoose.model('Like',LikeSchema);
module.exports=Like