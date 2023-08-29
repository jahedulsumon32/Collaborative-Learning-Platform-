const express=require('express')

const expressLayouts=require('express-ejs-layouts')

const mongoose=require('mongoose');
const flash=require('express-flash')
const session=require('express-session')
const passport=require('passport')
const app=express();
// passport config

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

// Global variables
app.use((req,res,next)=>{
    res.locals.success_msg=req.flash('success_msg')
    res.locals.error_msg=req.flash('error_msg')
    res.locals.error=req.flash('error')
    if(req.session.user){
    res.locals.user=req.session.user;
    }
    next();
});



// Routes
app.use('/',require('./routes/index.js'));
app.use('/users',require('./routes/users.js'));
const PORT=process.env.PORT||8080
app.listen(PORT,console.log(`Server started on port ${PORT}`));