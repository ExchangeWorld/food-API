'use strict';

var Restaurant = require('../../models').Restaurant;
var Sequelize = require('sequelize');
var Promise = require('bluebird');
var _ = require('lodash');



exports.create = function(req, res) {

};

/**
 * @api {get} /api/restaurant FindByID
 * @apiName restaurant.details
 * @apiGroup restaurant
 *
 * @apiParam {int} id restaurant_id
 *
 * @apiSuccess {object} Restaurant details
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 9,
 *       "name": "CoryBryd",
 *       "description": "Rhoncus bibendum au i enim ligula. Magna sodales tempus ultrices facilisis augue felis aliquet arcu arcu. Natoque mattis felis est lorem erat scelerisque ornare etiam.",
 *       "photo": "http://dummyimage.com/329x313/050/fff",
 *       "location": "Lebanon Bridgeport",
 *       "lat": -10.82728,
 *       "lon": 66.367019,
 *       "createdAt": "2016-04-13T05:34:14.643Z",
 *       "updatedAt": "2016-04-13T05:34:14.643Z"
 *     }
 * @apiSuccessExample not-found:
 *     HTTP/1.1 200 OK
 *     null
 *
 * @apiError ServerError server internal error
 * @apiError InvalidParams boundary not provided.
 * @apiErrorExample Invalid-Params:
 *     HTTP/1.1 400 error
 *     {
 *       "msg": "id must provided."
 *     }
 * @apiErrorExample Server-Error
 *     HTTP/1.1 500 error
 */
exports.details = function(req, res) {
    let id = parseInt(req.query.id, 10);

    if (!id) {
        return res.status(400).json({
            msg: 'id must provided.'
        });
    }

    Restaurant
        .findById(id)
        .then((restaurant)=> {
            res.json(restaurant);
        })
        .catch((err)=> {
            console.erroe(err);
            res.status(500).send();
        });
};

exports.destory = function(req, res) {

};

exports.update = function(req, res) {

};

// list of Restaurant's dishes
exports.dishesList = function(req, res) {

};

/**
 * @api {get} /api/restaurant/find Find 
 * @apiName restaurant.findRestaurantsWithBoundary
 * @apiGroup restaurant
 *
 * @apiParam {float} latMax upper bound of latitude
 * @apiParam {float} latMin lower bound of latitude
 * @apiParam {float} lonMax upper bound of longitude
 * @apiParam {float} lonMin lower bound of longitude
 *
 * @apiSuccess {array} Restaurants list of restaurant
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": 9,
 *         "name": "CoryBryd",
 *         "description": "Rhoncus bibendum au i enim ligula. Magna sodales tempus ultrices facilisis augue felis aliquet arcu arcu. Natoque mattis felis est lorem erat scelerisque ornare etiam.",
 *         "photo": "http://dummyimage.com/329x313/050/fff",
 *         "location": "Lebanon Bridgeport",
 *         "lat": -10.82728,
 *         "lon": 66.367019,
 *         "createdAt": "2016-04-13T05:34:14.643Z",
 *         "updatedAt": "2016-04-13T05:34:14.643Z"
 *       }
 *     ]
 *
 * @apiError ServerError server internal error
 * @apiError InvalidParams boundary not provided.
 * @apiErrorExample Invalid-Params:
 *     HTTP/1.1 400 error
 *     {
 *       "msg": "boundary must provided."
 *     }
 * @apiErrorExample Server-Error
 *     HTTP/1.1 500 error
 */
exports.findRestaurantsWithBoundary = function(req, res) {
    let boundary = {
        latMax: parseFloat(req.query.latMax),
        latMin: parseFloat(req.query.latMin),
        lonMax: parseFloat(req.query.lonMax),
        lonMin: parseFloat(req.query.lonMin)
    };

    if (!boundary.latMax || !boundary.latMin || !boundary.lonMax || !boundary.lonMin) {
        return res.status(400).json({
            msg: 'boundary must provided.'
        });
    }

    let query = {
        where: {
            lat: {
                $between: [boundary.latMin, boundary.latMax]
            },
            lon: {
                $between: [boundary.lonMin, boundary.lonMax]
            }
        }
    };

    Restaurant
        .findAll(query)
        .then((restaurants)=> {
            res.json(restaurants);
        })
        .catch((err)=> {
            console.erroe(err);
            res.status(500).send();
        });

};
