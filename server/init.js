// require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const mongoose = require('mongoose');
const User     = require("./models/user");

// const dbUrl = process.env.ATLASDB_URL;
const dbUrl = "mongodb://127.0.0.1:27017/expensetracker";
const seedUserDB = async () => {
  try {
    await User.deleteMany({});   // clear old seed data first
    console.log("cleared old users");

    await User.register(new User({
      username:   "kavya",
      email:      "kavya@gmail.com",
      occupation: "Software Engineer",
      ageGroup:   "18-25"
    }), "kavya123");

    await User.register(new User({
      username:   "rahul",
      email:      "rahul@gmail.com",
      occupation: "Student",
      ageGroup:   "18-25"
    }), "rahul123");

    await User.register(new User({
      username:   "priya",
      email:      "priya@gmail.com",
      occupation: "Teacher",
      ageGroup:   "26-35"
    }), "priya123");

    console.log("users seeded successfully");
  } catch (err) {
    console.error("seed failed:", err.message);
  }
};

const transactionData=[
  {
    "title": "Monthly Salary",
    "amount": 50000,
    "type": "income",
    "category": "salary",
    "date": "2025-06-01",
    "note": "June salary credited",
    "owner": "6a243a2432348cac71800834"
  },
  {
    "title": "Freelance Project",
    "amount": 12000,
    "type": "income",
    "category": "freelance",
    "date": "2025-06-05",
    "note": "Website development",
    "owner": "6a243a2532348cac71800835"
  },
  {
    "title": "Petrol",
    "amount": 2000,
    "type": "expense",
    "category": "transport",
    "date": "2025-06-10",
    "note": "Full tank refill",
    "owner": "6a243a2432348cac71800834"
  },
  {
    "title": "Electricity Bill",
    "amount": 1800,
    "type": "expense",
    "category": "bill",
    "date": "2025-06-12",
    "note": "Monthly bill payment",
    "owner": "6a243a2432348cac71800834"
  },
  {
    "title": "Grocery Shopping",
    "amount": 3500,
    "type": "expense",
    "category": "grocery",
    "date": "2025-06-15",
    "note": "Weekly groceries",
    "owner": "6a243a2532348cac71800835"
  },
  {
    "title": "Mutual Fund SIP",
    "amount": 5000,
    "type": "expense",
    "category": "investment",
    "date": "2025-06-20",
    "note": "Monthly SIP",
    "owner": "6a243a2532348cac71800835"
  }
];
const Transaction = require('./models/transaction.js');
const seedTransactionDB=async()=>{
  try{
    await Transaction.deleteMany({});
    console.log('Old data cleared');
    await Transaction.insertMany(transactionData);
    console.log(`${transactionData.length} transactions inserted`);    
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('\nConnection closed');
  }
};
async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("connected to db");
    // await seedUserDB();    
await seedTransactionDB();
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();  // always close when done
    console.log("connection closed");
  }
}
main();
