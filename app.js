const express = require('express');
const jwt = require('express-jwt');
const cors = require('cors');
const logger = require('morgan');
const bodyParser = require('body-parser');
const requireDir = require('require-dir');
const mongoose = require('mongoose');
const cron = require('node-cron');

require('dotenv').config();
mongoose.Promise = require('bluebird');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/hasBrain', { useMongoClient: true });

const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 50000
}));

// app.use(express.static('public'));

app.get('/', function (req, res) {res.status(200).send('OK!')});

app.use('/user', require('./src/routes/users'));

requireDir('./src/models');

app.use('/auth', require('./src/routes/auth'));

app.use(
  jwt({
    secret: process.env.HASBRAIN_SECRET_KEY,
    requestProperty: 'project',
    getToken: req => req.headers["x-hasbrain-token"] || req.query._token
}).unless({ method: 'OPTIONS' })
);

app.use('/questions', require('./src/routes/question'));
app.use('/skills', require('./src/routes/skill'));
app.use('/quiz', require('./src/routes/answer'));
app.use('/bookmark', require('./src/routes/bookmark'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {

  // render the error page
  res.status(err.status || 500).end();
});

let port = process.env.PORT || 2000;
app.listen(port);
console.log(`Server listening at ${port}`);

module.exports = app;
