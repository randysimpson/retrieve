const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const config = require('../model/config');

//fix the data where dates are strings.
const dbInterface = {
  connectDB: () => {
    return new Promise((resolve, reject) => {
      // Use connect method to connect to the server
      MongoClient.connect(config.dburl, function(err, client) {
        if(err) {
          reject(err);
        }

        resolve(client);
      });
    });
  },
  get: (client, collectionName, query, skip, limit, sort) => {
    return new Promise((resolve, reject) => {
      const db = client.db(config.database);

      // Get the metrics collection
      const collection = db.collection(collectionName);

      // query the data
      collection.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .toArray((err, docs) => {
          if(err) {
            reject(err);
          }

          resolve(docs);
        });
    });
  },
  count: (client, collectionName, query) => {
    return new Promise((resolve, reject) => {
      const db = client.db(config.database);

      // Get the metrics collection
      const collection = db.collection(collectionName);

      collection.find(query)
        .count((err, count) => {
          if(err) {
            reject(err);
          }

          resolve(count);
        });
    });
  },
  update: (client, collectionName, id, data) => {
    return new Promise((resolve, reject) => {
      const db = client.db(config.database);

      // Get the metrics collection
      const collection = db.collection(collectionName);

      // query the data
      collection.updateOne({ _id: ObjectID(id) },
        { $set: data }, (err, result) => {
          if(err) {
            reject(err);
          }

          resolve(result);
        });
    });
  },
  retrieve: (collectionName, query, sort) => {
    return new Promise((resolve, reject) => {
      dbInterface.connectDB()
        .then((client) => {
          const items = [];
          dbInterface.count(client, collectionName, query)
            .then((count) => {
              const requests = Math.floor(count / 1000) + 1;

              const arrayOfInt = [];
              for(let i = 0; i < requests; i++) {
                arrayOfInt.push(i * 1000);
              }

              return arrayOfInt.map(requestIndex => dbInterface.get(client, collectionName, query, requestIndex, 1000, sort))
                .reduce((sequence, requestPromise) => {
                  return sequence.then(() => {
                    return requestPromise;
                  }).then((results) => {
                    for(let i = 0; i < results.length; i++) {
                      items.push(results[i]);
                    }
                  });
                }, Promise.resolve());
            }, (err) => {
              reject(err);
            }).then(() => {
              //done
              resolve(items);
            }).catch((err) => {
              reject(err);
            }).then(() => {
              client.close();
            });
        }, err => reject(err));
    });
  },
  /*createIndex: (collectionName, fields) => {
    return new Promise((resolve, reject) => {
      dbInterface.connectDB()
        .then((client) => {
          const db = client.db(config.database);

          // Get the metrics collection
          const collection = db.collection(collectionName);

          // create the index
          collection.createIndex(fields)
        }, err => reject(err));
    });
  }*/
};

module.exports = dbInterface;
