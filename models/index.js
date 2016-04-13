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
var Restaurant = require("./restaurant").Restaurant(Sequelize, sequelize);
var Dish = require("./dish").Dish(Sequelize, sequelize);
var Like = require("./like").Like(Sequelize, sequelize);

Restaurant.hasMany(Dish, {
    foreignKey: 'restaurant_id',
    as: 'dishes'
});
Dish.belongsTo(Restaurant, {
    foreignKey: 'restaurant_id',
    as: 'restaurant'
});
Dish.hasMany(Like, {
    foreignKey: 'dish_id',
    as: 'likes'
});
Like.belongsTo(Dish, {
    foreignKey: 'dish_id',
    as: 'dish'
});
Member.hasMany(Like, {
    foreignKey: 'member_id',
    as: 'likes'
});
Like.belongsTo(Member, {
    foreignKey: 'member_id',
    as: 'member'
});

exports.sequelize = sequelize;
exports.Member = Member;
exports.MemberSession = MemberSession;
exports.Restaurant = Restaurant;
exports.Dish = Dish;
exports.Like = Like;

exports.sqlPromise = function(query) {
    return new Promise(function(resolve, reject) {
        query.success(function(result) {
            resolve(result);
        }).error(function(e) {
            reject(e);
        });
    });
};
