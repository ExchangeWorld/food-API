var sslEnabled = false;
var path = require('path');

module.exports = {

    enviroment: "production",

    port: (process.env.PORT || 3000),

    adminlist: [],

    middleware: {
        view_cache: true,
        logger_dev: false,
        less: false
    },

    model: {
        pg: {
            database: "DATABASE",
            account: "ACCOUNT",
            password: "PASSWORD",
            options: {
                host: "127.0.0.1",
                logging: false,
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
