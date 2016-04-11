'use strict'

const koa = require('koa')
const app = koa()
const router = require('koa-router')()


router.get('/', function*() {
});

app.use(require('koa-static')(__dirname + '/doc'));

app.listen(process.env.PORT || 3020, function() {
  console.log('Server start on Port: ' + (process.env.PORT || 3020));
});

