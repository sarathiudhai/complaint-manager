const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resolvex';
    
    // Attempt standard connection first
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] Connected to MongoDB at ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[DB] Could not connect to primary MONGO_URI (${error.message}). Initializing fallback in-memory MongoDB...`);
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[DB] Connected to MongoDB Memory Server at ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[DB] MongoMemoryServer fallback error:`, memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
