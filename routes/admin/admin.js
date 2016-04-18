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

/**
 * @api {post} /admin/restaurantList restaurantList
 * @apiName admin.restaurantList
 * @apiGroup admin 
 * @apiPermission Admin
 *
 * @apiParam {int} page start from 1
 *
 * @apiSuccess {array} restaurants array of restaurant data
 * @apiSuccessExample Success-Response:
 *     [
 *       {
 *         "id": 1,
 *         "name": "ErikDampier",
 *         "description": "Bibendum neque suscipit hendrerit a aliquam vulputate faucibus fringilla adipiscing nisi neque, auctor est auctor ante justo cras enim condimentum blandit euismod. Felis adipiscing nibh.",
 *         "photo": "http://dummyimage.com/450x384/050/fff",
 *         "location": "Antarctica Nottingham",
 *         "lat": 35.271565,
 *         "lon": 75.088134,
 *         "createdAt": "2016-04-13T05:34:14.598Z",
 *         "updatedAt": "2016-04-13T05:34:14.598Z"
 *       },
 *       ...
 *     ]
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 error
 */
exports.restaurantList = function(req, res) {
    let page = parseInt(req.query.page, 10);
    let limit = 20;

    if (!page) {
        return res.status(400).json({
            msg: 'page must provided.'
        });
    }

    Restaurant
        .findAll({
            limit: limit,
            offset: (page - 1)*limit
        })
        .then((restaurants)=> {
            return res.json(restaurants);
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
