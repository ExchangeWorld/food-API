var express = require('express');
var multer = require('multer');
var upload = multer();
var app = express();

var middlewares = require('../middleware/middlewares.js');
var member = require('./member');
var dish = require('./dish');
var restaurant = require('./restaurant');

// API logger
//app.use(middlewares.pageLog);

// member
app.post('/member/signup', member.signup);
app.post('/member/login', member.login);
app.get('/member/status', middlewares.checkLogin, member.status);
app.post('/member/logout', middlewares.checkLogin, member.logout);


// dish
app.post('/dish/like', middlewares.checkLogin, dish.like);


// restaurant
app.get('/restaurant', restaurant.details);
app.get('/restaurant/find', restaurant.findRestaurantsWithBoundary);
app.get('/restaurant/dishes', restaurant.dishesList);

module.exports = app;
