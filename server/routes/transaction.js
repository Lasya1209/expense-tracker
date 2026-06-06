const express=require('express');
const router=express.Router();
const Transaction=require('../models/transaction.js');
const asyncWrap=require('../utils/asyncWrap.js');
const CustomError=require('../utils/CustomError.js');
const transactionController=require('../controllers/transaction.js');
const {isLoggedIn,isOwner}=require('../utils/middlewares.js');
const  validateTransaction = require('../utils/validateTransaction.js');
//summary
router.get("/summary",isLoggedIn,asyncWrap(transactionController.getSummary));
//getTransactionsByFilters
router.post("/filter",isLoggedIn,asyncWrap(transactionController.applyFilters));
//categorySummary
router.get("/category-summary",isLoggedIn,asyncWrap(transactionController.getCategorySummary));
//monthlySummary
router.get("/monthly-summary",isLoggedIn,asyncWrap(transactionController.getMonthlySummary));
//create
router.post("/new",isLoggedIn,validateTransaction,asyncWrap(transactionController.createTransaction));
//get by id
router.get("/:id",isLoggedIn,isOwner,asyncWrap(transactionController.getTransaction));
//edit
router.patch("/edit/:id",isLoggedIn,isOwner,validateTransaction,asyncWrap(transactionController.editTransaction));
//delete
router.delete("/delete/:id",isLoggedIn,isOwner,asyncWrap(transactionController.deleteTransaction));
//get
router.get("/",isLoggedIn,asyncWrap(transactionController.getTransactions));
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
