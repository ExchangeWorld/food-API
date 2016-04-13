exports.Restaurant = function(Sequelize, sequelize) {
    return sequelize.define('Restaurant', {
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
        photo: {
            type: Sequelize.STRING,
            allowNull: true
        },
        location: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lat: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        lon: {
            type: Sequelize.FLOAT,
            allowNull: false
        }
    }, {
        tableName: 'restaurant',
        indexes: [{
            fields: ['lat'],
            method: 'BTREE'
        }, {
            fields: ['lon'],
            method: 'BTREE'
        }]
    });
};
