const MongoClient = require('mongodb').MongoClient;
const config = require('../model/config');

//save this data object into database.
const loadData = (collectionName, beginDate, endDate, metric) => {
  return new Promise((resolve, reject) => {
    // Use connect method to connect to the server
    MongoClient.connect(config.dburl, function(err, client) {
      if(err) {
        reject(err);
      }
      const db = client.db(config.database);

      // Get the metrics collection
      const collection = db.collection(collectionName);

      const query = {
        metric: metric,
        date: {
          $lte: new Date(endDate),
          $gte: new Date(beginDate)
        }
      }

      // query the data
      collection.find(query).sort({ date: -1 }).toArray((err, docs) => {
        client.close();
        if(err) {
          reject(err);
        }
        resolve(docs);
      });
    });
  })
};

module.exports = loadData;
