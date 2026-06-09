const envFile = process.env.NODE_ENV === "production" 
  ? ".env.production" 
  : ".env";
require("dotenv").config({ path: envFile });
const express = require('express');
const app = express();
const MongoStore = require('connect-mongo').default;
const mongoose = require("mongoose");
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const port = process.env.PORT || 5000;
 const path = require("path");
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const session = require("express-session");
const helmet = require("helmet");
const CustomError = require('./utils/CustomError.js');
const User = require('./models/user.js');
const transactionRouter = require("./routes/transaction.js");
const userRouter = require("./routes/user.js");
const dbUrl = process.env.ATLASDB_URL;
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs", "access.log"),
  { flags: "a" }
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); 
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,  
  credentials: true
}));
async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("connected to db");
  } catch (err) {
    console.log(err);
  }
}
main();
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
    touchAfter: 24 * 3600,
  }
});
store.on("error", (err) => { console.log("ERROR IN MONGO SESSION STORE", err); });
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true
  }
};
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/api/transactions", transactionRouter);
app.use("/api/users", userRouter);

app.use(express.static(path.join(__dirname, "../client/dist")));
app.use((err, req, res, next) => {
  let { status = 500, message = "Something Went Wrong!!!" } = err;
  console.log(`Status : ${status} . Message : ${message}`);
  res.status(status).json({ message });
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});