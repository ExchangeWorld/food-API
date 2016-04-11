exports.Dish = function(Sequelize, sequelize) {
    return sequelize.define('Dish', {
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
        score: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'dish'
    });
};
