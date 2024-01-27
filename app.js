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
const Room = require('./models/Room');
const User = require('./models/User');
const Message = require('./models/Messages');
const {ObjectId}=require('mongodb')
require('./config/passport')(passport);
const chatFeature=require('./controller/chatFeature');
const ADMIN = "Admin"


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
  console.log(`'User Connected'`);

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
// Upon connection - only to user 
socket.emit('message', chatFeature.buildMsg(ADMIN, "Welcome to Chat Room!"))

socket.on('enterRoom', async ({ name, room }) => {

    // leave previous room 
    const prevRoom = chatFeature.getUser(socket.id)?.room

    if (prevRoom) {
        socket.leave(prevRoom)
        io.to(prevRoom).emit('message', chatFeature.buildMsg(ADMIN, `${name} has left the room`))
    }

    const user = chatFeature.activateUser(socket.id, name, room)

    // Cannot update previous room users list until after the state update in activate user 
    if (prevRoom) {
        await Room.findOneAndUpdate({ name: prevRoom }, { $pull: { users: user._id } });
     
        io.to(prevRoom).emit('userList', {
            users: chatFeature.getUsersInRoom(prevRoom)
        })
    }

    // join room 
    socket.join(user.room)
    await Room.findOneAndUpdate({ name: user.room }, { $addToSet: { users: user._id } });
    // To user who joined 
    socket.emit('message', chatFeature.buildMsg(ADMIN, `You have joined the ${user.room} chat room`))
// Message event with MongoDB operations
socket.on('message', async ({ name, text }) => {
    const room = chatFeature.getUser(socket.id)?.room;

    const roomName = chatFeature.getUser(socket.id)?.room;

    if (roomName) {
        // Check if the room exists
        let room = await Room.findOne({ name: roomName });

        // If the room doesn't exist, create it
        if (!room) {
            room = await Room.create({ name: roomName });
        }
        // Create the message
        const user = await User.findOne({ name: name });
        const message = new Message({
            content: text,
            room: room._id,
            sender: user._id,
        });

        await message.save();

        io.to(room._id).emit('message', chatFeature.buildMsg(name, text));
    }
  });

    // To everyone else 
    socket.broadcast.to(user.room).emit('message', chatFeature.buildMsg(ADMIN, `${user.name} has joined the room`))

    // Update user list for room 
    io.to(user.room).emit('userList', {
        users: chatFeature.getUsersInRoom(user.room)
    })

    // Update rooms list for everyone 
    io.emit('roomList', {
        rooms: chatFeature.getAllActiveRooms()
    })
})

// 

// When user disconnects - to all others const count = io.engine.clientsCount;
// const count2 = io.of("/").sockets.size;
// console.log({'count':count,'count2':count2})
socket.on('disconnect', () => {
    const user = chatFeature.getUser(socket.id)
    chatFeature.userLeavesApp(socket.id)

    if (user) {
        io.to(user.room).emit('message', chatFeature.buildMsg(ADMIN, `${user.name} has left the room`))

        io.to(user.room).emit('userList', {
            users: chatFeature.getUsersInRoom(user.room)
        })

        io.emit('roomList', {
            rooms: chatFeature.getAllActiveRooms()
        })
    }

    console.log(`User ${socket.id} disconnected`)
})

// Listening for a message event 
socket.on('message', ({ name, text }) => {
    const room = chatFeature.getUser(socket.id)?.room
    if (room) {
        io.to(room).emit('message', chatFeature.buildMsg(name, text))
    }
})

// Listen for activity 
socket.on('activity', (name) => {
    const room = chatFeature.getUser(socket.id)?.room
    if (room) {
        socket.broadcast.to(room).emit('activity', name)
    }
})
})




  const PORT=process.env.PORT||8080
  http.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
  })
// app.listen(PORT,console.log(`Server started on port ${PORT}`));
