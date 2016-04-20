'use strict';
var Sequelize = require('sequelize');
var Promise = require('bluebird');
var _ = require('lodash');

var Dish = require('../../models').Dish;
var Member = require('../../models').Member;
var MemberSession = require('../../models').MemberSession;
var Restaurant = require('../../models').Restaurant;

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

exports.memberDetails = function(req, res) {
    let _id = parseInt(req.params.id, 10);

    if (!_id) {
        return res.status(400).json({
            msg: 'id must provided.'
        });
    }

    Member
        .findById(_id)
        .then((result)=> {
            return res.json(result);
        })
        .catch((err)=> {
            console.error(err);
            res.status(500).send();
        });
};

exports.memberEdit = function(req, res) {
    let newVal = req.body;
    let id = newVal.id;
    newVal = _.pick(newVal, 'user', 'username', 'facebookId');

    Member
        .findById(id)
        .then((member)=> {
            _.assign(member, newVal);
            return member.save();
        })
        .then(()=> {
            res.status(204).send();
        })
        .catch((err)=> {
            console.error(err);
            res.status(500).send();
        });
};

exports.dishList = function(req, res) {
    let page = parseInt(req.query._page, 10);
    let limit = 20;

    if (!page) {
        return res.status(400).json({
            msg: 'page must provided.'
        });
    }

    Dish
        .findAndCountAll({
            limit: limit,
            offset: (page - 1)*limit,
            order: 'id DESC'
        })
        .then((result)=> {
            result.rows= result.rows.map((m)=>{
                return _.pick(m, ['id', 'name', 'restaurant_id', 'score']);
            });
            res.append('X-Total-Count', result.count);

            return res.json(result.rows);
        })
        .catch((err)=> {
            console.error(err);
            res.status(500).send();
        });
};

exports.dishDetails = function(req, res) {
    let _id = parseInt(req.params.id, 10);

    if (!_id) {
        return res.status(400).json({
            msg: 'id must provided.'
        });
    }

    Dish
        .findById(_id)
        .then((result)=> {
            return res.json(result);
        })
        .catch((err)=> {
            console.error(err);
            res.status(500).send();
        });
};

exports.dishEdit = function(req, res) {
    let newVal = req.body;
    let id = newVal.id;
    newVal = _.pick(newVal, 'name', 'score', 'restaurant_id', 'description', 'lat', 'lon');

    Dish
        .findById(id)
        .then((dish)=> {
            _.assign(dish, newVal);
            return dish.save();
        })
        .then(()=> {
            res.status(204).send();
        })
        .catch((err)=> {
            console.error(err);
            res.status(500).send();
        });
};

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

exports.restaurantDetails = function(req, res) {
    let _id = parseInt(req.params.id, 10);

    if (!_id) {
        return res.status(400).json({
            msg: 'id must provided.'
        });
    }

    Restaurant
        .findById(_id)
        .then((result)=> {
            return res.json(result);
        })
        .catch((err)=> {
            console.error(err);
            res.status(500).send();
        });
};

exports.restaurantEdit = function(req, res) {
    let newVal = req.body;
    let id = newVal.id;
    newVal = _.pick(newVal, 'name', 'location', 'description', 'lat', 'lon');

    Restaurant
        .findById(id)
        .then((restaurant)=> {
            _.assign(restaurant, newVal);
            return restaurant.save();
        })
        .then(()=> {
            res.status(204).send();
        })
        .catch((err)=> {
            console.error(err);
            res.status(500).send();
        });
};

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
