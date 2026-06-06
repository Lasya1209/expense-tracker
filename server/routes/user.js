const express=require('express');
const router=express.Router();
const passport=require("passport");
const User=require('../models/user.js');
const asyncWrap=require('../utils/asyncWrap.js');
const CustomError=require('../utils/CustomError.js');
const userController=require('../controllers/user.js');
const middlewares=require('../utils/middlewares.js');
const { validateSignup, validateLogin, validateUpdate } = require('../utils/validateUser.js');
//signup-createUser
router.post("/signup",validateSignup,asyncWrap(userController.createUser));
//login
router.post("/login",validateLogin,passport.authenticate("local",{
    failWithError: true
  }),asyncWrap(userController.login));
  router.post("/logout",asyncWrap(userController.logout));
//authentication->get curr user
router.get("/current-user",userController.setCurrUser);
router.use((req,res,next)=>{
 next(new CustomError(404,"Page Not Found!"));
});
router.use((err,req,res,next)=>{
let {status=500,message="Some err occ"}=err;
res.status(status).json({
        success:false,
        message
    });
});
module.exports=router;

