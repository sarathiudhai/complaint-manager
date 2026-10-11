const mongoose = require('mongoose');

const connectDB = async () => {
  const configuredMongoUri = process.env.MONGO_URI;
  const mongoUri = configuredMongoUri || 'mongodb://127.0.0.1:27017/resolvex';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] Connected to MongoDB at ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    if (configuredMongoUri) {
      throw new Error(`Could not connect to configured MONGO_URI: ${error.message}`);
    }

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
