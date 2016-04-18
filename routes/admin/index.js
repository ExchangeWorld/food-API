var express = require('express');

var middlewares = require('../middleware/middlewares');
var admin = require('./admin');

var app = express();

app.get('/memberlist', middlewares.checkAdmin, admin.memberList);
app.get('/restaurantlist', middlewares.checkAdmin, admin.restaurantList);

app.post('/dish', middlewares.checkAdmin, admin.dishCreate);
app.post('/restaurant', middlewares.checkAdmin, admin.restaurantCreate);

module.exports = app;