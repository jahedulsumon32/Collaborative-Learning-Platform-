
    ensureAuthenticated=(req,res,next)=>{
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg','Please log in to your account');
        res.redirect('/users/login')
    }
   
    
module.exports={
    ensureAuthenticated,
}