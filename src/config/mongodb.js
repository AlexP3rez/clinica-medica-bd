const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB;

const client = new MongoClient(uri, {
  maxPoolSize: 10,
});

let db = null;

async function connectMongo() {
  if (db) return db;
  await client.connect();
  db = client.db(dbName);
  console.log('MongoDB conectado:', dbName);
  return db;
}

function getDb() {
  if (!db) throw new Error('MongoDB no conectado. Llama connectMongo() primero.');
  return db;
}

module.exports = { connectMongo, getDb };
