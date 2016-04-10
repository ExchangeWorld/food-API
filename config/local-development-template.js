var sslEnabled = false;
var path = require('path');

module.exports = {

    enviroment: "development",

    port: (process.env.PORT || 3000),

    middleware: {
        view_cache: false,
        logger_dev: true,
        less: false
    },

    model: {
        pg: {
            database: "DATABASE",
            account: "ACCOUNT",
            password: "PASSWORD",
            options: {
                host: "127.0.0.1",
                logging: console.log,
                dialect: 'postgres',
                define: {
                    charset: 'utf8',
                    collate: 'utf8_general_ci'
                }
            }
        },
    },

    post_redis: {
        redis: {
            host: 'localhost',
            port: 6379
        }
    },
    post_redis_readonly: {
        redis: {
            host: 'localhost',
            port: 6379
        }
    },
    push_redis: {
        redis: {
            host: 'localhost',
            port: 6379
        }
    },
    session: {
        redis: {
            host: 'localhost',
            port: 6379
        }
    }
};
