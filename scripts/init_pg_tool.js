var sequelize = require('../models').sequelize;
var option = { force: false };

if (process.argv.length > 2)
    option.force = true;

    console.log(process.argv);

sequelize
    .sync(option)
    .then(function(res) {
        console.log('success');
        process.exit(0);
    })
    .catch(function(err) {
        console.error(err);
        process.exit(1);
    });
