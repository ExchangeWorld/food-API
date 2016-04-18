var express = require('express');

var middlewares = require('../middleware/middlewares');
var admin = require('./admin');

var app = express();

app.get('/memberlist', middlewares.checkAdmin, admin.memberList);
app.post('/dish', middlewares.checkAdmin, admin.dishCreate);

module.exports = app;