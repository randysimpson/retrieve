const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const config = require('../model/config');

//fix the data where dates are strings.
const fixData = {
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
  retrieve : (client, collectionName, skip) => {
    return new Promise((resolve, reject) => {
      const db = client.db(config.database);

      // Get the metrics collection
      const collection = db.collection(collectionName);

      // query the data
      collection.find({})
        .skip(skip)
        .limit(1000)
        .sort({ date: 1 })
        .toArray((err, docs) => {
          if(err) {
            reject(err);
          }

          const issues = docs.filter(metric => (typeof metric.date === 'string'));
          resolve(issues);
        });
    });
  },
  count: (client, collectionName) => {
    return new Promise((resolve, reject) => {
      const db = client.db(config.database);

      // Get the metrics collection
      const collection = db.collection(collectionName);

      collection.find({})
        .count((err, count) => {
          if(err) {
            reject(err);
          }
          resolve(count);
        });
    });
  },
  fixCount: 0,
  getIssues: (collectionName) => {
    return new Promise((resolve, reject) => {
      fixData.connectDB()
        .then((client) => {
          fixData.count(client, collectionName)
            .then((count) => {
              const requests = Math.floor(count / 1000) + 1;
              console.log("requests: " + requests);

              const arrayOfInt = [];
              for(let i = 0; i < requests; i++) {
                arrayOfInt.push(i * 1000);
              }
              return arrayOfInt.reduce((sequence, requestIndex) => {
                return sequence.then(() => {
                  return fixData.retrieve(client, collectionName, requestIndex);
                }).then((retrieveResults) => {
                  console.log("retrieveResults: " + retrieveResults.length);
                  if(retrieveResults.length > 0) {
                    const updates = retrieveResults.map(issue => fixData.update(client, collectionName, issue._id, issue.date));
                    Promise.all(updates)
                      .then((results) => {
                        fixData.fixCount += results.length
                      }, err => {
                        console.log({
                          date: new Date(),
                          err
                        })
                      })
                  }
                });
              }, Promise.resolve());
            }, (err) => {
              client.close();
              reject(err);
            }).then(() => {
              //update all the list.
              console.log({
                date: new Date(),
                status: "fixed " + fixData.fixCount + " issues"
              });
              client.close();
            }).catch((err) => {
              console.error({
                date: new Date(),
                err
              });
              client.close();
            });
        }, err => reject(err));

        resolve({
          date: new Date(),
          status: "Beginning fix..."
        })
    });
  },
  updatePromises: [],
  update: (client, collectionName, id, date) => {
    return new Promise((resolve, reject) => {
      const db = client.db(config.database);

      // Get the metrics collection
      const collection = db.collection(collectionName);

      // query the data
      collection.updateOne({ _id: ObjectID(id) },
        { $set: { date: new Date(date) }}, (err, result) => {
          if(err) {
            reject(err);
          }
          resolve(result);
        });
    });
  }
};

module.exports = fixData;
