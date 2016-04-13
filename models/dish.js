'use strict';
var local = require("../config/local");
var Sequelize = require('sequelize');
var sequelize = new Sequelize(
    local.model.pg.database,
    local.model.pg.account,
    local.model.pg.password,
    local.model.pg.options
);

var Restaurant = require("./restaurant").Restaurant(Sequelize, sequelize);

exports.Dish = function(Sequelize, sequelize) {
    const Dish = sequelize.define('Dish', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true
        },
        restaurant_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        photo: {
            type: Sequelize.STRING,
            allowNull: true
        },
        lat: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        lon: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        score: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'dish'
    });


    // set lat, lon as restaurant's location
    Dish.beforeCreate(function(instance, options) {
        return Restaurant
            .findById(instance.restaurant_id)
            .then((restaurant)=> {
                instance.lat = restaurant.lat;
                instance.lon = restaurant.lon;
            });
    });

    return Dish;
};
