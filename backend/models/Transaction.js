const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    protocolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Protocol',
      required: true,
    },
    protocolName: { type: String, required: true },
    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAWAL', 'CLAIM_REWARD', 'REBALANCE'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    asset: {
      type: String,
      default: 'USDC',
    },
    chain: {
      type: String,
      default: 'Ethereum',
    },
    txHash: {
      type: String,
      default: () => '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'PENDING', 'FAILED'],
      default: 'CONFIRMED',
    },
    gasFeeUsd: {
      type: Number,
      default: 4.25,
    },
    notes: {
      type: String,
      default: 'Treasury allocation executed via Smart Router',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
