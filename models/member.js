exports.Member = function(Sequelize, sequelize) {
    return sequelize.define('Member', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user: {
            type: Sequelize.STRING,
            allowNull: true,
            validate: {
                isEmail: {
                    args: true,
                    msg: "信箱格式錯誤"
                }
            }
        },
        password: {
            type: Sequelize.STRING
        },
        username: Sequelize.STRING,
        gender: {
            type: Sequelize.STRING
        },
        photo: Sequelize.STRING,
        level: {
            type: Sequelize.INTEGER,
            defaultValue: 3
        },
        facebookId: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'member'
    });
};
