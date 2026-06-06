const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense']    // removed duplicate required
    },
    category: {
      type: String,
      required: true,
      enum: ['salary','freelance','returns','grocery','bill',
             'emi','fees','health','transport','entertainment',
             'investment','other'],
      default: 'other'
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  // ↓ second argument — schema options
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.owner;
        return ret;
      }
    }
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;