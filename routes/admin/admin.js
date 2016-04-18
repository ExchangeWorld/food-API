'use strict';
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

/**
 * @api {post} /api/dish Create
 * @apiName dish.create
 * @apiGroup dish
 *
 * @apiParam {string} name dish name
 * @apiParam {int} restaurant_id 
 * @apiParam {string} [description] dish's description
 * @apiParam {string} [photo] dish's photo name.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 OK
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 error
 */
exports.dishCreate = function(req, res) {
    let newDish = {
        name: req.body.name,
        restaurant_id: parseInt(req.body.restaurant_id, 10),
        description: req.body.description,
        photo: req.body.photo
    };

    if (!newDish.name || !newDish.restaurant_id) {
        return res.status(400).json({
            msg: 'name & restaurant_id must provided.'
        });
    }

    Dish
        .create(newDish)
        .then(()=> {
            res.status(201).send()
        })
        .catch((err)=> {
            console.error(err);
            res.status(500).send();
        });
};

