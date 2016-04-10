var sequelize = require('../models').sequelize;

sequelize
    .sync()
    .then(function(res) {
        console.log('success');
        process.exit(0);
    })
    .catch(function(err) {
        console.error(err);
        process.exit(1);
    });
