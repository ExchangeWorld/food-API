'use strict';
var local = require("../config/local");
var Sequelize = require('sequelize');
var sequelize = new Sequelize(
    local.model.pg.database,
    local.model.pg.account,
    local.model.pg.password,
    local.model.pg.options
);

var Dish = require("./dish").Dish(Sequelize, sequelize);

exports.Like = function(Sequelize, sequelize) {
    const Like = sequelize.define('like', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        member_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        dish_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        point: {
            type: Sequelize.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'like',
        indexes: [{
            fields: ['member_id'],
            method: 'BTREE'
        }, {
            fields: ['dish_id'],
            method: 'BTREE'
        }]
    });

    Like.beforeCreate(function(instance, options) {
        return Dish
            .findById(instance.dish_id)
            .then((dish)=> {
                dish.score += instance.point;
                return dish.save();
            });
    });

    Like.beforeDestroy(function(instance, options) {
        return Dish
            .findById(instance.dish_id)
            .then((dish)=> {
                dish.score -= instance.point;
                return dish.save();
            });
    });

    return Like;
};
