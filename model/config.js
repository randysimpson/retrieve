
const config = {
  version: process.env.npm_package_version,
  podName: process.env.POD_NAME || "unknown",
  dburl: process.env.DB_URL || 'mongodb://localhost:27017',
  database: process.env.DB_NAME || "retrieve"
};

module.exports = config;
