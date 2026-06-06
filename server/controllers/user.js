const User=require('../models/user.js');
const CustomError=require('../utils/CustomError.js');
const createUser=async(req,res)=>{
    let {
        username,
        email,
        occupation,
        ageGroup,
        password
    } = req.body;
    let user=new User({
        username,
        email,
        occupation,
        ageGroup
    });
const result = await User.register(user, password);
req.login(result, (err) => {
    if (err) {
        return res.status(500).json({ message: err.message });
    }   
    return res.json({
    success: true,
    user: {
        _id:        result._id,
        username:   result.username,
        email:      result.email,
        occupation: result.occupation,
        ageGroup:   result.ageGroup,
    }
});
});
}
const login=async(req,res)=>{ 
     if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false
        });
    }
    res.json({
        success: true,
        user: req.user,
    });
}
const setCurrUser=(req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false
        });
    }
    res.json({
        success: true,
        user: req.user,
    });
}
const logout=async(req,res)=>{
   req.logout((err)=>{
if(err) return res.status(500).json({success:false});
res.json({success:true});
   });

}
module.exports={createUser,login,setCurrUser,logout};

