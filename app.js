const express=require('express')

const expressLayouts=require('express-ejs-layouts')

const mongoose=require('mongoose');
const flash=require('express-flash')
const session=require('express-session')
const passport=require('passport')
const app=express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http,{});
const Like = require('./models/Like');
const {ObjectId}=require('mongodb')
require('./config/passport')(passport);

// Database configure
const db=require('./config/keys').MongoURI;
mongoose.connect(db,{useNewUrlParser:true}).then(()=>console.log('Mongodb connected...')).catch(err=>console.log(err));
app.use(express.static('public'));
app.use(expressLayouts);
app.set('view engine','ejs');

// Body parser
app.use(express.urlencoded({extended:false}));

// express session

app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
})
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.locals.io = io;
// Global variables that will save different error msg and success message
app.use((req,res,next)=>{
    res.locals.success_msg=req.flash('success_msg')
    res.locals.error_msg=req.flash('error_msg')
    res.locals.error=req.flash('error')
    
    if(req.session.user){
    res.locals.user=req.session.user;
    }
    next();
});



// Routes are defined 
app.use('/',require('./routes/index.js'));
app.use('/users',require('./routes/users.js'));



io.on("connection",function(socket){
  console.log('User Connected');

  socket.on("new_comment",function(comment){
    io.emit("new_comment",comment);
});

socket.on("new_reply",function(reply){
    io.emit("new_reply",reply);
});

  socket.on("like", async function(data){
    await Like.updateOne({
        post_id:data.post_id,
        user_id:data.user_id
    }, {
        type:1
    },
    {
        upsert: true
    });

    const likes = await Like.find({ "post_id":data.post_id,type:1 }).count();
    const dislikes = await Like.find({ "post_id":data.post_id,type:0 }).count();

    io.emit("like_dislike",{
        post_id:data.post_id,
        likes:likes,
        dislikes:dislikes
    });
});

socket.on("dislike", async function(data){
    await Like.updateOne({
        post_id:data.post_id,
        user_id:data.user_id
    }, {
        type:0
    },
    {
        upsert: true
    });

    const likes = await Like.find({ "post_id":data.post_id,type:1 }).count();
    const dislikes = await Like.find({ "post_id":data.post_id,type:0 }).count();

    io.emit("like_dislike",{
        post_id:data.post_id,
        likes:likes,
        dislikes:dislikes
    });
});


});

  const PORT=process.env.PORT||8080
  http.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
  })
// app.listen(PORT,console.log(`Server started on port ${PORT}`));
