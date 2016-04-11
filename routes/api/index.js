var express = require('express');

var middlewares = require('../middleware/middlewares.js');
var member = require('./member');
var multer = require('multer');
var upload = multer();

var app = express();

// API logger
//app.use(middlewares.pageLog);

// member
app.post('/member/signup', member.signup);
app.post('/member/login', member.login);




module.exports = app;
