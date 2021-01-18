var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const createAuthMiddleware = require('./create-auth-middleware')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/anonymous/hello-world', cors(), helloWorld);
app.use('/authenticated/hello-world', cors(), createAuthMiddleware(), helloWorld);
app.use('/authorized/hello-world', cors(), createAuthMiddleware(['se-orders-write']), helloWorld);

function helloWorld(req, res) {
    res.status(200).json({ message: 'Hello world!' })
}

module.exports = app;
