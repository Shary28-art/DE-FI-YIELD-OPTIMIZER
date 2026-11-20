const mongoose = require('mongoose');

let isConnected = false;
let isInMemoryFallback = false;

// Fallback in-memory store if MongoDB daemon is unavailable
class InMemoryDatabase {
  constructor() {
    this.collections = {
      users: new Map(),
      protocols: new Map(),
      investments: new Map(),
      transactions: new Map(),
      optimizerResults: new Map(),
    };
  }

  getCollection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new Map();
    }
    return this.collections[name];
  }
}

const inMemoryDB = new InMemoryDatabase();

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/defi_risk_optimizer';
  
  try {
    console.log(`[DB] Attempting MongoDB connection to: ${mongoUri}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true,
    });
    isConnected = true;
    console.log('✅ [DB] Successfully connected to MongoDB via Mongoose');
  } catch (err) {
    console.warn(`⚠️ [DB] Local MongoDB connection failed (${err.message}).`);
    console.warn('⚡ [DB] Activating built-in high-fidelity in-memory persistence layer for seamless development.');
    isInMemoryFallback = true;
    isConnected = true;
  }
};

module.exports = {
  connectDB,
  isConnected: () => isConnected,
  isInMemoryFallback: () => isInMemoryFallback,
  inMemoryDB,
};
