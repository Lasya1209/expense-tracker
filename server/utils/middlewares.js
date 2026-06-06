const Transaction = require("../models/transaction");
const isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        // req.session.redirectUrl=req.originalUrl;
        return res.status(401).json({
            success:false,
            message:"You need to login first!"
        });
    }
    console.log("logged in");
   return next();
}
// const saveRedirectUrl=(req,res,next)=>{
//     if(req.session.redirectUrl)res.locals.redirectUrl=req.session.redirectUrl;
//     return next();
// }
const isOwner=async(req,res,next)=>{
let {id}=req.params;
console.log(id);
console.log("user:", req.user);
let transaction=await Transaction.findById(id);
console.log(transaction);
 if(!transaction){
        return res.status(404).json({
            success:false,
            message:"Transaction not found"
        });
    }
    console.log(req.user);
if(!transaction.owner.equals(req.user._id)){
    console.log(`Error : You are not owner`);
    return res.status(403).json({
            success: false,
            message: "You are not authorized"
        });
} 
console.log("you are authorized");
return next();
}
module.exports={isLoggedIn,isOwner};
