const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true       
    },

    occupation: {
      type: String,
      default: "",
      trim: true
    },

    ageGroup: {
      type: String,
      enum: ["18-25", "26-35", "36-45", "46+"],
      default: null
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.hash;        // passport-local-mongoose adds these
        delete ret.salt;      
        return ret;
      }
    }
  }
);

userSchema.plugin(passportLocalMongoose.default);   
const User = mongoose.model("User", userSchema);
module.exports = User;