var express = require('express');

var middlewares = require('../middleware/middlewares');
var home = require('./home');
var admin = require('./admin');

var app = express();

app.get('/memberlist', middlewares.checkAdmin, admin.memberList);
app.get('/memberlist/:id', middlewares.checkAdmin, admin.memberDetails);
app.put('/memberlist/:id', middlewares.checkAdmin, admin.memberEdit);

app.get('/dishlist', middlewares.checkAdmin, admin.dishList);
app.get('/dishlist/:id', middlewares.checkAdmin, admin.dishDetails);
app.put('/dishlist/:id', middlewares.checkAdmin, admin.dishEdit);
app.post('/dish', middlewares.checkAdmin, admin.dishCreate);

app.get('/restaurantlist', middlewares.checkAdmin, admin.restaurantList);
app.get('/restaurantlist/:id', middlewares.checkAdmin, admin.restaurantDetails);
app.put('/restaurantlist/:id', middlewares.checkAdmin, admin.restaurantEdit);
app.post('/restaurant', middlewares.checkAdmin, admin.restaurantCreate);


app.get('/', middlewares.checkAdmin, home.index);
module.exports = app;