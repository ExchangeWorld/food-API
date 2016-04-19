'use strict';
var Sequelize = require('sequelize');
var Promise = require('bluebird');
var _ = require('lodash');

var Member = require('../../models').Member;
var MemberSession = require('../../models').MemberSession;
var Restaurant = require('../../models').Restaurant;

/**
 * @api {post} /admin/memberList memberList
 * @apiName admin.memberList
 * @apiGroup admin 
 * @apiPermission Admin
 *
 * @apiParam {int} _page start from 1
 *
 * @apiSuccess {array} members array of member data
 * @apiSuccessExample Success-Response:
 *     [
 *       {
 *         "id": 1,
 *         "user": "travis.rohloff@coolinga.xyz",
 *         "username": "TravisRohloff",
 *         "level": 1,
 *         "facebookId": null,
 *       },
 *       ...
 *     ]
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 error
 */
exports.memberList = function(req, res) {
    let page = parseInt(req.query._page, 10);
    let limit = 20;

    if (!page) {
        return res.status(400).json({
            msg: 'page must provided.'
        });
    }

    Member
        .findAndCountAll({
            limit: limit,
            offset: (page - 1)*limit,
            order: 'id DESC'
        })
        .then((result)=> {
            result.members = result.rows.map((m)=>{
                return _.pick(m, ['id', 'user', 'username', 'level', 'facebookId']);
            });
            res.append('X-Total-Count', result.count);

            return res.json(result.members);
        })
        .catch((err)=> {
            console.error(err);
            res.status(500).send();
        });
};

/**
 * @api {post} /admin/restaurantList restaurantList
 * @apiName admin.restaurantList
 * @apiGroup admin 
 * @apiPermission Admin
 *
 * @apiParam {int} _page start from 1
 *
 * @apiSuccess {array} restaurants array of restaurant data
 * @apiSuccessExample Success-Response:
 *     [
 *       {
 *         "id": 1,
 *         "name": "ErikDampier",
 *         "location": "Antarctica Nottingham",
 *       },
 *       ...
 *     ]
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 error
 */
exports.restaurantList = function(req, res) {
    let page = parseInt(req.query._page, 10);
    let limit = 20;

    if (!page) {
        return res.status(400).json({
            msg: 'page must provided.'
        });
    }

    Restaurant
        .findAndCountAll({
            limit: limit,
            offset: (page - 1)*limit,
            order: 'id DESC'
        })
        .then((result)=> {
            result.rows.forEach((m)=>{
                return _.pick(m, ['id', 'name', 'location']);
            });
            res.append('X-Total-Count', result.count);

            return res.json(result.rows);
        })
        .catch((err)=> {
            console.error(err);
            res.status(500).send();
        });
};

/**
 * @api {post} /admin/dish Create Dish
 * @apiName admin.dishCreate
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

/**
 * @api {post} /admin/restaurant Create Restaurant
 * @apiName admin.restaurantCreate
 * @apiGroup admin 
 * @apiPermission Admin
 *
 * @apiParam {string} name restaurant name
 * @apiParam {float} lat latitude of restaurant 
 * @apiParam {float} lon longtitude of restaurant 
 * @apiParam {string} location address of restaurant 
 * @apiParam {string} [description] description of restaurant
 * @apiParam {string} [photo] restaurant's photo filename.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 OK
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 error
 */
exports.restaurantCreate = function(req, res) {
    let newRestaurant = {
        name: req.body.name,
        description: req.body.description,
        photo: req.body.photo,
        location: req.body.location,
        lat: parseFloat(req.body.lat),
        lon: parseFloat(req.body.lon)
    };

    if (!newRestaurant.name || !newRestaurant.location || !newRestaurant.lat || !newRestaurant.lon) {
        return res.status(400).json({
            msg: 'missing value.'
        });
    }

    Restaurant
        .create(newRestaurant)
        .then(()=> { res.status(201).send(); })
        .catch((err)=> {
            console.error(err);
            res.status(500).send();
        });
};
