'use strict';
var Sequelize = require('sequelize');
var Promise = require('bluebird');
var _ = require('lodash');

var Member = require('../../models').Member;
var MemberSession = require('../../models').MemberSession;

/**
 * @api {post} /admin/memberList memberList
 * @apiName admin.memberList
 * @apiGroup admin 
 * @apiPermission Admin
 *
 * @apiParam {int} page start from 1
 *
 * @apiSuccess {array} members array of member data
 * @apiSuccessExample Success-Response:
 *     [
 *       {
 *         "id": 1,
 *         "user": "travis.rohloff@coolinga.xyz",
 *         "password": "8138d687d0d5",
 *         "username": "TravisRohloff",
 *         "gender": "M",
 *         "photo": "http://dummyimage.com/455x383/500/fff",
 *         "level": 1,
 *         "facebookId": null,
 *         "createdAt": "2016-04-13T05:34:14.895Z",
 *         "updatedAt": "2016-04-13T05:34:14.895Z"
 *       },
 *       ...
 *     ]
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 error
 */
exports.memberList = function(req, res) {
    let page = parseInt(req.query.page, 10);
    let limit = 20;

    if (!page) {
        return res.status(400).json({
            msg: 'page must provided.'
        });
    }

    Member
        .findAll({
            limit: limit,
            offset: (page - 1)*limit
        })
        .then((members)=> {
            return res.json(members);
        })
        .catch((err)=> {
            console.error(err);
            res.status(500).send();
        });
};

exports.restaruantList = function(req, res) {

};

/**
 * @api {post} /admin/dish Create Dish
 * @apiName dish.create
 * @apiGroup admin 
 * @apiPermission Admin
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

