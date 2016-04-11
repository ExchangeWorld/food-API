var Promise = require("bluebird");
var local = require("../config/local");
var Sequelize = require('sequelize');
var sequelize = new Sequelize(
    local.model.pg.database,
    local.model.pg.account,
    local.model.pg.password,
    local.model.pg.options
);

var Member = require("./member").Member(Sequelize, sequelize);
var MemberSession = require("./member_session").MemberSession(Sequelize, sequelize);
var Dish = require("./dish").Dish(Sequelize, sequelize);
var Restaurant = require("./restaurant").Restaurant(Sequelize, sequelize);

Restaurant.hasMany(Dish, {
    foreignKey: 'restaurantId',
    as: 'Dishes'
});
Dish.belongsTo(Restaurant, {
    foreignKey: 'restaurantId',
    as: 'restaurant'
});

exports.sqlPromise = function(query) {
    return new Promise(function(resolve, reject) {
        query.success(function(result) {
            resolve(result);
        }).error(function(e) {
            reject(e);
        });
    });
};

exports.sequelize = sequelize;
exports.Member = Member;
exports.MemberSession = MemberSession;
exports.Dish = Dish;
exports.Restaurant = Restaurant;
