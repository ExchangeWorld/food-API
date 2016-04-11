var Sequelize = require('sequelize');
var Promise = require('bluebird');
var _ = require('lodash');

var Member = require('../../models').Member;
var MemberSession = require('../../models').MemberSession;





exports.memberList = function(req, res) {
    console.log(req);
    res.status(201).send();
};

exports.restaruantList = function(req, res) {

};
