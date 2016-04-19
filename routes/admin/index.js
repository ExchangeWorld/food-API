var express = require('express');

var middlewares = require('../middleware/middlewares');
var home = require('./home');
var admin = require('./admin');

var app = express();

app.get('/memberlist', middlewares.checkAdmin, admin.memberList);
app.get('/restaurantlist', middlewares.checkAdmin, admin.restaurantList);

app.post('/dish', middlewares.checkAdmin, admin.dishCreate);
app.post('/restaurant', middlewares.checkAdmin, admin.restaurantCreate);

app.get('/', middlewares.checkAdmin, home.index);
module.exports = app;