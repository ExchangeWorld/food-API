var Member = require('../../models').Member;
var MemberSession = require('../../models').MemberSession;
var Sequelize = require('sequelize');
var Promise = require('bluebird');
var _ = require('lodash');
var passwordHash = require('../../lib/md5').passwordHash;
var moment = require('moment');
var async = require('async');
var request = require('request');
var requestAsync = Promise.promisify(request);

var redis = require('redis');
var local = require('../../config/local');
var client = redis.createClient(local.post_redis.port, local.post_redis.host);
client = Promise.promisifyAll(client);
if (local.post_redis.pass) {
    client.auth(local.post_redis.pass);
}

var dns = require('dns');
var Fuse = require('fuse.js');
var fs = require('fs');
var util_path = require('path');

/**
 * @api {post} /api/member/signup Signup
 * @apiName member.signup
 * @apiGroup member
 *
 * @apiParam {string} user member unique email.
 * @apiParam {string} password member password
 * @apiParam {string} username user name.
 * @apiParam {string} gender user gender
 *
 * @apiSuccess {bool} success success
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true
 *     }
 *
 * @apiError ServerError server internal error
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 error
 *     {
 *       "error": err_object
 *     }
 */
exports.signup = function(req, res) {
    var newMember = {
        user: req.body.user,
        password: req.body.password,
        username: req.body.username,
        gender: req.body.gender
    };

    if (!newMember.user || !newMember.password || !newMember.username || !newMember.gender) {
        return res.status(400).json({
            error: true,
            msg: 'invaild parameters'
        });
    }

    Member
        .create(newMember)
        .then(function(member) {
            res.json({
                success: true
            });
        })
        .catch(function(err) {
            res.status(500).json({
                error: err
            });
        });
};

// move out real world login logic, so dcard and facebook login can use it
var letMeLogin = function(user, req, res, response) {
    req.session.user = user;
    req.session.isLogin = true;

    return MemberSession.create({
        member_id: user.dataValues.id,
        session_id: req.session.id
    })
    .then(function(session) {
        // omit password field
        response.user = _.omit(user.dataValues, 'password');
        response.isLogin = true;
        response.isValidate = true;
        return res.json(response);
    })
    .catch(function(err) {
        console.error('login error:', err);
    });
};

/**
 * @api {post} /api/member/login Login
 * @apiName member.login
 * @apiGroup member
 *
 * @apiParam {string} user member's account(email).
 * @apiParam {string} password member's password
 *
 * @apiSuccess {object} memberObject details of member data
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *         "id": 9,
 *         "user": "aswe@gmail.com",
 *         "username": "req.body.username",
 *         "gender": "M",
 *         "photo": null,
 *         "level": 1,
 *         "facebookId": null,
 *         "createdAt": "2016-04-12T03:26:19.430Z",
 *         "updatedAt": "2016-04-12T03:26:19.430Z"
 *       },
 *       "isLogin": true,
 *       "isValidate": true
 *     }
 *
 * @apiError UserNotFound Account/password not match
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 error
 *     {
 *       "isLogin": false,
 *       "msg": "帳號與密碼組合錯誤"
 *     }
 */
exports.login = function(req, res) {
    // check user and password are valid
    if (!req.body.user || !req.body.password) {
        return res.status(400).json({
            isLogin: false,
            msg: '請輸入帳號密碼',
        });
    }

    var user = req.body.user;
    var password = req.body.password;

    var where = {
        where: Sequelize.or({
            user: user
        })
    };

    // first find username in member
    Member
        .find(where)
        .then(function(user) {
            var response = {};
            var halt_time = Math.round((Math.random() + 1) * 1000);
            setTimeout(function() {
                if (!user) {
                    req.session.isLogin = false;
                    response.isLogin = false;
                    response.isValidate = true;
                } else {
                    // username is correct, but password is not correct
                    if (user.password !== passwordHash(password)) {
                        req.session.isLogin = false;
                        response.isLogin = false;
                        response.msg = '帳號與密碼組合錯誤';
                        return res.status(400).json(response);
                    }
                    letMeLogin(user, req, res, response);
                }
            }, halt_time);
        }).error(function(err) {
            console.error('login Member.find error: ', err);
            res.status(500).json({
                msg: 'server error',
                isLogin: false
            });
        });
};

/**
 * @api {get} /api/member/status member status
 * @apiName member.status
 * @apiGroup member
 *
 * @apiSuccess {object} memberObject details of "current session" member data
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "isLogin": true,
 *       "fb_login": {
 *         "status": false
 *       },
 *       "user": {
 *         "username": "req.body.username",
 *         "user": "aswe@gmail.com",
 *         "level": 1,
 *         "gender": "M",
 *         "photo": null
 *       }
 *     }
 *
 * @apiError NoSession not login.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 error
 *     {
 *       "error": true,
 *       "msg": "請登入"
 *     }
 */
exports.status = function(req, res) {
    var response = {
        isLogin: false,
        fb_login: {
            status: false
        }
    };

    if ((!_.has(req.session, 'isLogin')) || !req.session.isLogin) {
        return res.json(response);
    }

    response.isLogin = req.session.isLogin;

    var id = req.session.user.id;

    var tasks = {
        //notification: sequelize.query(notification_sql),
    };

    Promise
        .props(tasks)
        .then(function(results) {
            response.user = {
                username: req.session.user.username,
                user: req.session.user.user,
                level: req.session.user.level,
                gender: req.session.user.gender,
                photo: req.session.user.photo
            };

            res.json(response);
        });
};

// get facebook member id by access token
var getFbMember = function(accessToken) {
    return requestAsync({
        url: "https://graph.facebook.com/v2.4/me",
        qs: {
            access_token: accessToken
        },
        json: true
    }).spread(function(response, body) {
        // check status code
        if (response.statusCode !== 200) {
            throw new Error('status code: ' + response.statusCode);
        }

        // check body and body.id and body.name exists
        if (!body || !body.id || !body.name) {
            throw new Error('response error');
        }

        //return response body
        return body;
    });
};

exports.facebook_login = function(req, res) {
    var accessToken = req.body.accessToken;

    if (!accessToken) {
        return res.status(405).json({
            msg: 'invalid parameters'
        });
    }

    getFbMember(accessToken)
        .then(function(member) {
            // get member_id by facebook id
            return mongo.facebook_login.findOneAsync({
                    facebook_id: member.id
                })
                .then(function(data) {
                    return {
                        database: data,
                        facebookId: member.id
                    };
                });
        })
        .then(function(result) {
            if (!result.database) {
                // there is no datas in facebook_login,
                // should redirect to /fb-integrate and do the integration
                res.json({
                    msg: 'first time fb login'
                });
            } else {
                // login
                var where = {
                    where: {
                        id: result.database.member_id
                    }
                };
                var response = {};
                Member.find(where).success(function(user) {
                    if (!user) {
                        res.status(500).json({
                            msg: 'cannot find user'
                        });
                        return;
                    }
                    var halt_time = Math.round((Math.random() + 1) * 1000);
                    setTimeout(function() {
                        letMeLogin(user, req, res, response);
                    }, halt_time);
                });
            }
        })
        .catch(function(err) {
            console.error('facebook_login getFbMember error:', err);
            //slackbot.phantom("[member.js facebook_login getFbMember] " + err, req);
            res.status(500).json({
                error: true
            });
        });
};

// login using facebook
exports.facebook_integrate = function(req, res) {
    var accessToken = req.body.accessToken;
    var member_id = parseInt(req.session.user.id);

    if (!accessToken) {
        return res.status(405).json({
            msg: 'invalid parameters'
        });
    }

    // get facebook id by access token
    getFbMember(accessToken)
        .then(function(member) {
            // get member_id by facebook id
            return mongo.facebook_login.findOneAsync({
                    member_id: member_id
                })
                .then(function(data) {
                    return {
                        database: data,
                        facebook: member
                    };
                });
        })
        .then(function(result) {
            res.json({
                msg: 'facebook integrate success!',
                type: result.database ? 'update' : 'insert'
            });

            mongo.facebook_login.remove({
                facebook_id: result.facebook.id
            }, function(err) {
                if (err) {
                    console.error('facebook_integrate facebook_login.remove error:', err);
                    slackbot.phantom("[member.js facebook_integrate getFbMember] " + err, req);
                    res.status(500).json({
                        error: true
                    });
                    return;
                }

                // upsert facebook login data
                mongo.facebook_login.update({
                    member_id: member_id
                }, {
                    $set: {
                        member_id: member_id,
                        facebook_id: result.facebook.id,
                        facebook_name: result.facebook.name,
                        createdAt: new Date()
                    }
                }, {
                    upsert: true
                });
            });
        })
        .catch(function(err) {
            console.error('facebook_integrate getFbMember error:', err);
            //slackbot.phantom("[member.js facebook_integrate getFbMember] " + err, req);
            res.status(500).json({
                error: true
            });
        });
};

/**
 * @api {post} /api/member/logout Logout
 * @apiName member.logout
 * @apiGroup member
 *
 * @apiSuccess {object} isLogin =false
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "isLogin": false,
 *     }
 *
 * @apiError NoSession not login.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 error
 *     {
 *       "error": true,
 *       "msg": "請登入"
 *     }
 */
exports.logout = function(req, res) {
    req.session.destroy(function() {
        res.json({
            isLogin: false
        });
    });
};
