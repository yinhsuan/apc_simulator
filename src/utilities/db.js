const logger = require('./logger')('DB');
// const MongoClient = require('mongodb').MongoClient;
const dbConfig = require('config').db;

const { MongoClient, ServerApiVersion } = require('mongodb');
// const client = new MongoClient(dbConfig.url);
const client = new MongoClient(dbConfig.url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
let db = undefined;

// const connect = () => {
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
// }

const connect = () => {
  if (db) return db;
  // connect to MongoDB
  client.connect();
  // logger.info(`dbName: ${dbConfig.dbName}`);
  db = client.db(dbConfig.dbName);

  if (!db) {
    logger.info('MongoDB connected failed!');
    return;
  }
  logger.info('MongoDB successfully connected!');

  for (const [key, value] of Object.entries(dbConfig.initValue)) {
    logger.info(`init default value: ${key}=${value}`);
    // reset or insert init value
    getCollection('factors').updateOne(
      { name: key },
      { $set: { name: key, value: value } },
      { upsert: true },
    );
  }
  return db;
}

const disconnect = () => {
  if (!db) return;
  logger.info('MongoDB successfully disconnected!');
  client.close();
}

const getCollection = (collectionName) => {
  if (!db) {
    logger.error('The database is not connected, you should call `connect()` first.');
    return;
  }
  return db.collection(collectionName);
}

module.exports = {
  connect,
  disconnect,
  getCollection,
};