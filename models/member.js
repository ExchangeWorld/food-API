'use strict';

var passwordHash = require('../lib/md5').passwordHash;

exports.Member = function(Sequelize, sequelize) {
    let Member = sequelize.define('Member', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
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
            type: Sequelize.STRING,
            defaultValue: 'F'
        },
        photo: Sequelize.STRING,
        level: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        facebookId: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'member'
    });

    // encoded password with md5
    Member.beforeCreate(function(instance, options) {
        instance.password = passwordHash(instance.password);
        return instance;
    });

    return Member;
};
