const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('express-log-mongo');
const config = require('./model/config');

const indexRouter = require('./routes/index');
const metricsRouter = require('./routes/metrics');

const app = express();

app.use(logger('default', {
    url: config.dburl,
    db: config.database,
    collection: 'logs'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// parse application/json
app.use(bodyParser.json());

//blank test index
app.use('/', indexRouter);
app.use('/metrics', metricsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
