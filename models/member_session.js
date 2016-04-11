exports.MemberSession = function(Sequelize, sequelize) {
    return sequelize.define('MemberSession', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        member_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        session_id: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        tableName: 'member_session'
    });
};
