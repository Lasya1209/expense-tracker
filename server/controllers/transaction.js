const mongoose=require('mongoose');
const Transaction=require('../models/transaction.js');
const CustomError=require('../utils/CustomError.js');
const getTransactions=async(req,res)=>{
    let transactions=await Transaction.find({owner:new mongoose.Types.ObjectId(req.user._id)});   
    // console.log(transactions);
   res.json({
    transactions
});
}
const applyFilters = async (req, res) => {
    let {
        title,
        type,
        category,
        minAmount,
        maxAmount,
        from,
        to,
        primarySort,
        secondarySort
    } = req.body;

    let filters = { owner: new mongoose.Types.ObjectId(req.user._id) };

    // title search
    if(title){
        filters.title = {
            $regex: title,
            $options: "i"
        };
    }

    // type
    if(type){
        filters.type = type;
    }

    // category
    if(category){
        filters.category = category;
    }

    // amount range
    if(minAmount || maxAmount){

        filters.amount = {};

        if(minAmount){
            filters.amount.$gte = Number(minAmount);
        }

        if(maxAmount){
            filters.amount.$lte = Number(maxAmount);
        }
    }

    // date range
    if(from || to){

        filters.date = {};

        if(from){
            filters.date.$gte = new Date(from);
        }

        if(to){
            filters.date.$lte = new Date(to);
        }
        
    }
// Primary Sort
let sortQuery = {};
switch (primarySort) {
    case "latest":
        sortQuery.date = -1;
        break;
    case "oldest":
        sortQuery.date = 1;
        break;
    case "highest":
        sortQuery.amount = -1;
        break;
    case "lowest":
        sortQuery.amount = 1;
        break;
}
switch (secondarySort) {
    case "latest":
        sortQuery.date = -1;
        break;
    case "oldest":
        sortQuery.date = 1;
        break;
    case "highest":
        sortQuery.amount = -1;
        break;
    case "lowest":
        sortQuery.amount = 1;
        break;
}
let query = Transaction.find(filters);
if (primarySort || secondarySort) {
    query = query.sort(sortQuery);
}
let transactions = await query;
return res.json({transactions});
}
const createTransaction=async(req,res)=>{
    let {title,amount,type,category,date,note}=req.body;
    let transaction=new Transaction({title,amount,type,category,date,note,owner:new mongoose.Types.ObjectId(req.user._id)});
    let result=await transaction.save();
    res.json({result});
}
const getTransaction=async(req,res)=>{
    let {id}=req.params;
    let transaction=await Transaction.findById(id);
    res.json({transaction});
}
const editTransaction=async(req,res)=>{
let {id}=req.params;
let {title,amount,type,category,date,note}=req.body;
let result=await Transaction.findByIdAndUpdate(id,{title:title,amount:amount,type:type,category:category,date:date,note:note},{runValidators:true,new:true});
res.json({result:result});
}
const deleteTransaction=async(req,res)=>{
    let {id}=req.params;
    let result=await Transaction.findByIdAndDelete(id);
    if (!result) throw new CustomError(404, "Transaction not found");
    console.log("transaction deleted");
    res.json({ message: "Transaction deleted" });
}
const getSummary=async(req,res)=>{
    let result=await Transaction.aggregate([
        {$match: { owner: new mongoose.Types.ObjectId(req.user._id) }} , 
        {$group:
            {
                _id:'$type',
            total:{$sum:'$amount'}
        }
        }

    ]);
    const summary={income:0,expense:0};
    result.forEach(r => { summary[r._id] = r.total; });
    summary.balance=summary.income-summary.expense;
    res.json(summary);
}
const getCategorySummary = async (req, res) => {
    let result = await Transaction.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id),
                type: "expense"        // only expenses make sense for category breakdown
            }
        },
        {
            $group: {
                _id: "$category",
                total: { $sum: "$amount" }
            }
        },
        {
            $sort: { total: -1 }
        }
    ]);
    res.json(result);
};
// server — getMonthlySummary controller
const getMonthlySummary = async (req, res) => {
  let result = await Transaction.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(req.user._id) } },
    {
      $group: {
        _id: {
          year:  { $year: "$date" },
          month: { $month: "$date" }
        },
        income:  { $sum: { $cond: [{ $eq: ["$type", "income"]  }, "$amount", 0] } },
        expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
  res.json(result);
};

module.exports={getTransactions,applyFilters,createTransaction,getTransaction,editTransaction,deleteTransaction,getSummary,getCategorySummary,getMonthlySummary};