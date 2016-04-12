var express = require('express');
var path = require('path');
var http = require('http');
var _ = require('lodash');
var compression = require('compression');
var morgan = require('morgan');
var serveStatic = require('serve-static');
var errorhandler = require('errorhandler');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var csurf = require('csurf');

var config = require('./config/local');

var COOKIE_SECRET = 'cjdehrenmj43kife3r3';
var SESSION_SECRET = 'kdwnksjwlp9812,;xd';

exports = module.exports = function(options) {
    var app = express();
    var env = app.get('env');
    var PRODUCTION = env === 'production';

    app.use(errorhandler({
        dumpExceptions: !PRODUCTION,
        showStack: !PRODUCTION
    }));

    options = _.extend({
        log: true,
        csrf: true
    }, options);

    // Configuration
    app.locals.config = config;
    //app.set('views', path.join(__dirname, 'views'));
    //app.set('view engine', 'ejs');
    //app.engine('ejs', require('ejs').renderFile);

    if (PRODUCTION) {
        app.enable('view cache');
    }

    // Body parser
    app.use(bodyParser.json({
        limit: '50mb'
    }));
    app.use(bodyParser.urlencoded({
        limit: '50mb',
        extended: false
    }));

    // Method override
    app.use(methodOverride('_method'));

    // Logger
    if (options.log) {
        var logFormat = typeof options.log === 'string' ? options.log : 'dev';
        app.use(morgan(logFormat));
    }

    // Serve static files
    app.use(serveStatic(path.join(__dirname, 'public'), {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }));

    // Compression
    app.use(compression());

    // Cookie parser
    app.use(cookieParser(COOKIE_SECRET));

    // Session
    app.use(session({
        store: new RedisStore(config.session.redis),
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
        }
    }));

    // CSRF
    if (options.csrf) {
        app.use(csurf());

        app.use(function(req, res, next) {
            if (req.session.isLogin && req.cookies.ca !== 'true') {
                res.cookie('ca', 'true');
            } else if (!req.session.isLogin && req.cookies.ca) {
                res.clearCookie('ca');
            }

            res.cookie('XSRF-TOKEN', req.csrfToken());
            next();
        });

        // CSRF error handler
        app.use(function(err, req, res, next) {
            if (err.code !== 'EBADCSRFTOKEN') {
                return next(err);
            }

            // handle CSRF token errors here
            res.status(403);
            res.send('CSRF token invalid');
        });
    }

    // Register routes
    require('./routes')(app);

    return app;
};

exports.server = function(options) {
    var app = exports(options);

    http.createServer(app).listen(config.port, function() {
        console.log('Server listening at %s:%s', 'localhost', config.port);
    });
};
