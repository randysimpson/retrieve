# Retrieve

Application used to retrieve metrics that were ingested into a database using the [ingestor app](https://github.com/randysimpson/ingestor).

## Setup/Prereq

* Must have a database running in either postgres or mongo.
* Have a table schema setup
* Needs some data in the database to retrieve

## Docker

The easiest way to get the app up and running is to use docker.

### Run with Mongo

To run the retrieve app using docker on port 3000 for mongo the following environment variables must be passed in:

* __DB_HOST__ = host where mongo is running
* __DB_PORT__ = port that mongo is listening
* __DB_NAME__ = name of the database in mongo to use
* __DB_TYPE__ = must equal `mongo` for a mongo database

#### Mongo Command

`docker run -d -p 3000:3000 -e "DB_HOST=192.168.0.20" -e "DB_PORT=31917" -e "DB_NAME=metrics" -e "DB_TYPE=mongo" randysimpson/retrieve:latest`

Example:

```
pi@pibot:~ $ docker run -d -p 3000:3000 -e "DB_HOST=192.168.0.20" -e "DB_PORT=31917" -e "DB_NAME=metrics" -e "DB_TYPE=mongo" randysimpson/retrieve:latest
fd062193c2efeb1b778cd526f73264547faf2459ae2928ad30f6c6ed0928f366
```

### Run with Postgres

To run the retrieve app using docker on port 3000 for postgres the following environment variables must be passed in:

* __DB_HOST__ = host where postgres is running
* __DB_PORT__ = port that postgres is listening
* __DB_USER__ = username in postgres to connect with
* __DB_PASS__ = password in postgres for user provided
* __DB_NAME__ = name of the database in postgres to use
* __DB_TYPE__ = must equal `pg` for a postgres database

#### Postgres Command

`docker run -d -p 3000:3000 -e "DB_HOST=192.168.0.20" -e "DB_PORT=31917" -e "DB_NAME=metrics" -e "DB_USER=user" -e "DB_PASS=pass" -e "DB_TYPE=pg" randysimpson/retrieve:latest`

Example:

```
pi@pibot:~ $ docker run -d -p 3000:3000 -e "DB_HOST=192.168.0.20" -e "DB_PORT=31917" -e "DB_NAME=metrics" -e "DB_USER=user" -e "DB_PASS=pass" -e "DB_TYPE=pg" randysimpson/retrieve:latest
fd062193c2efeb1b778cd526f73264547faf2459ae2928ad30f6c6ed0928f366
```

## Usage

* `/` - Get

  To get a health check or the specific version of the retrieve application that is running:

  __Command__

  `curl -i -X GET http://localhost:3000/`

  __Example__

  ```
  pi@pibot:~ $ curl -i -X GET http://localhost:3000/
  HTTP/1.1 200 OK
  Date: Thu, 13 Aug 2020 04:33:13 GMT
  Content-Length: 53
  Content-Type: text/plain; charset=utf-8

  { "version":"2.0.0", "date":"2020-08-13T04:33:13ZZ" }
  ```

* `/api/v1/metrics` - Post

  To get the set of metrics from the database using the filters provided in the request body:

  __Command__

  `curl -i -d '{ "beginDate":"2020-08-10T00:30:48.489Z", "endDate":"2020-08-10T00:33:48.489Z", "metric":"queue.save" }'  -H "Content-Type: application/json" -X POST http://localhost:3000/api/v1/metrics`

  __Example__

  ```
  pi@pibot:~ $ curl -i -d '{ "beginDate":"2020-08-10T00:30:48.489Z", "endDate":"2020-08-10T00:33:48.489Z", "metric":"queue.save" }'  -H "Content-Type: application/json" -X POST http://localhost:3000/api/v1/metrics
  HTTP/1.1 200 OK
  Date: Thu, 13 Aug 2020 04:33:25 GMT
  Content-Length: 1227
  Content-Type: text/plain; charset=utf-8

  [{"date":"2020-08-10T00:30:50.417Z","metric":"queue.save","source":"ingestor","tags":{"podName":"ingestor-5ffc4f5584-p57sh"},"value":56},{"date":"2020-08-10T00:31:01.134Z","metric":"queue.save","source":"ingestor","tags":{"podName":"ingestor-5ffc4f5584-lfsvx"},"value":58},{"date":"2020-08-10T00:31:47.949Z","metric":"queue.save","source":"ingestor","tags":{"podName":"ingestor-5ffc4f5584-dxthz"},"value":121},{"date":"2020-08-10T00:31:50.433Z","metric":"queue.save","source":"ingestor","tags":{"podName":"ingestor-5ffc4f5584-p57sh"},"value":5},{"date":"2020-08-10T00:32:01.153Z","metric":"queue.save","source":"ingestor","tags":{"podName":"ingestor-5ffc4f5584-lfsvx"},"value":56},{"date":"2020-08-10T00:32:47.959Z","metric":"queue.save","source":"ingestor","tags":{"podName":"ingestor-5ffc4f5584-dxthz"},"value":121},{"date":"2020-08-10T00:32:50.434Z","metric":"queue.save","source":"ingestor","tags":{"podName":"ingestor-5ffc4f5584-p57sh"},"value":121},{"date":"2020-08-10T00:33:01.196Z","metric":"queue.save","source":"ingestor","tags":{"podName":"ingestor-5ffc4f5584-lfsvx"},"value":1},{"date":"2020-08-10T00:33:47.961Z","metric":"queue.save","source":"ingestor","tags":{"podName":"ingestor-5ffc4f5584-dxthz"},"value":83}]
  ```