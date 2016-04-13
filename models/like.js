exports.Like = function(Sequelize, sequelize) {
    return sequelize.define('like', {
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
};
