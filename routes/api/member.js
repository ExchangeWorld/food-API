/*
 * Serve JSON to our AngularJS client
 */

var Member = require('../../models').Member;
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


exports.signup = function(req, res) {
    var unicode = Math.random().toString().substring(2, 13);
    req.body.unicode = unicode;
    var isPre = _.find(school_waitlist.school, function(item) {
        return item === req.body.school;
    });
    if (isPre) return res.json({
        error: {
            school: ["你的學校尚未開放呦chu~"]
        }
    });

    Applicant.create(req.body).success(function(applicant) {
        res.json({
            success: true
        });

        var validate_url = "https://www.dcard.tw/api/member/validate/" + applicant.id + "x" + unicode;

        // send verification email to school email
        var mailOptions = {
            from: 'crossonmidnight@gmail.com', // sender address
            to: req.body.user, // list of receivers
            subject: "Dcard 註冊認證信", // Subject line
            footer: true,
            html: "Hi, " + req.body.username + ":" +
                "<br><br>感謝你的註冊，請點擊下方連結，點擊完後即認證成功" +
                "<br>並請靜待一天工作天，審核完後會寄發審核通過的信件" +
                "<br><br>祝你能認識新朋友:)" +
                "<br><br>帳號:" + req.body.user +
                "<br><br><a href=" + validate_url + ">" + validate_url + "</a>"
        };
        sendMail(mailOptions);
        // send verification email to usual email
        mailOptions = {
            from: 'crossonmidnight@gmail.com', // sender address
            to: req.body.usualmail, // list of receivers
            subject: "Dcard 驗證提醒信(我不是驗證信)", // Subject line
            theme: true,
            footer: true,
            html: "Hi, " + req.body.username + ":" +
                "<br><br>感謝你的註冊，請去學校信箱查看信件驗證帳號" +
                "<br>驗證帳號後請靜待一個工作天，狄卡審核完後會寄發審核通過的信件通知你" +
                "<br>如果學校信箱沒有收到驗證信，請用原本註冊的學校信箱寄一封信到 <a href='mailto:crossonmidnight@gmail.com' style='color:yellow'>crossonmidnight@gmail.com</a>" +
                "<br>按下列格式：" +
                "<br>標題：驗證信" +
                "<br><br>內文：你的姓名"
        };
        sendMail(mailOptions);


    }).error(function(err) {
        res.json({
            error: err
        });
    });
};


// move out real world login logic, so dcard and facebook login can use it
var letMeLogin = function(user, req, res, response) {
    return memberBlackList.findAsync({
        member_id: user.id
    }).then(function(m) {
        if (m.length) {
            req.session.isLogin = false;
            response.isLogin = false;
            response.msg = '帳號遭到停權';
            throw new BlackMember();
        }
        return mongo.facebook_login.findOneAsync({
            member_id: user.id
        }, {
            _id: 0,
            facebook_id: 1,
            facebook_name: 1
        });
    }).then(function(facebook_login) {
        req.session.facebook = facebook_login || false;
        return mongo.logincounters.findAsync({
            member_id: user.id
        })
    }).then(function(loginCount) {
        if (loginCount.length) {
            req.session.firstLogin = false;
            req.session.withinOneDay = loginCount[0].createdAt;
            mongo.logincounters.updateAsync({
                member_id: user.id
            }, {
                $inc: {
                    count: 1
                },
                $set: {
                    updatedAt: new Date()
                }
            }).then();
        } else {
            req.session.firstLogin = true;
            req.session.withinOneDay = new Date(Date.now());
            mongo.logincounters.insertAsync({
                member_id: user.id,
                count: 1,
                updatedAt: new Date(),
                createdAt: new Date()
            }).then();
        }
        req.session.user = user;
        req.session.isLogin = true;

        return mongo.member_sessions.insert({
            member_id: user.dataValues.id,
            session_id: req.session.id
        });
    }).then(function(session) {
        // omit password field
        response.user = _.omit(user.dataValues, 'password');
        // UGLY: temporary fix iOS facebook login carsh.
        if (!response.user.user) {
            response.user.user = '';
        }
        response.isLogin = true;
        response.isValidate = true;
        return res.json(response);
    }).catch(BlackMember, function(e) {
        res.json(response);
    }).catch(function(err) {
        console.error('login memberBlackList.findAsync error:', err);
        slackbot.phantom("[member.js login memberBlackList.findAsync()] " + err, req);
    });
};

exports.login = function(req, res) {
    // POST parameters: user, password

    // check user and password are valid
    if (!req.body.user || !req.body.password) {
        return res.json({
            isLogin: false,
            msg: '請輸入帳號密碼',
        });
    }

    var username = req.body.user;
    var password = req.body.password;

    var where = {
        where: Sequelize.or({
            user: username
        }, {
            usualmail: username
        })
    };

    // first find username in member
    Member.find(where).success(function(user) {
        var response = {};
        var halt_time = Math.round((Math.random() + 1) * 1000);
        setTimeout(function() {
            if (!user) {
                req.session.isLogin = false;
                response.isLogin = false;
                response.isValidate = true;
                Applicant.find(where).success(function(applicant) {
                    if (!applicant) {
                        PreApplicant.find({
                            where: Sequelize.or({
                                user: username
                            }, {
                                usualmail: username
                            })
                        }).success(function(pre_applicant) {
                            if (!pre_applicant) {
                                // check if the account(usualmail/schoolmail) is not validated
                                FirstApplicant.find({
                                    where: {
                                        usualmail: username
                                    }
                                }).then(function(user) {
                                    if (!user) {
                                        SecondApplicant.find({
                                            where: {
                                                user: username
                                            }
                                        }).then(function(user) {
                                            if (user) {
                                                response.isValidate = false;
                                                response.msg = '請至該信箱收取驗證信唷！';
                                                return res.json(response);
                                            } else {
                                                response.msg = '帳號與密碼組合錯誤';
                                                return res.json(response);
                                            }
                                        }, function(err) {
                                            console.error('login SecondApplicant.find error: ', err);
                                            slackbot.phantom("[member.js login SecondApplicant.find() error] : " + err, req);
                                            return res.status(500).json({
                                                error: true
                                            });
                                        });
                                    } else {
                                        response.isValidate = false;
                                        response.msg = '請至該信箱收取驗證信唷！';
                                        return res.json(response);
                                    }
                                }, function(err) {
                                    console.error('login FirstApplicant.find error: ', err);
                                    slackbot.phantom("[member.js login FirstApplicant.find() error] : " + err, req);
                                    return res.status(500).json({
                                        error: true
                                    });
                                });
                            } else {
                                if (pre_applicant.verified_school && pre_applicant.verified_usual) {
                                    response.msg = '已驗證成功，現在就等學校開放囉～～～';
                                } else if (pre_applicant.verified_school && !pre_applicant.verified_usual) {
                                    response.msg = '已成功驗證學校信箱，請至常用信箱收驗證信';
                                } else {
                                    response.msg = "請至學校信箱收驗證信呦～～～<br />如果沒收到請用學校信箱按下列格式寄一封信到<br />crossonmidnight@gmail.com<br />用學校信箱寄完信就算驗證成功";
                                    response.isValidate = false;
                                }
                                return res.json(response);
                            }
                        }).error(function(err) {
                            console.error('login PreApplicant.find error:', err);
                            slackbot.phantom("[member.js login PreApplicant.find() error] : " + err, req);
                            res.status(500).json({
                                error: true
                            });
                        });
                    } else {
                        if (applicant.verified) {
                            response.msg = '帳號審核中，驗證完後 1-3天，審核過即可登入';
                        } else {
                            response.msg = '此帳號尚未驗證，請前往學校信箱收取認證信，或用學校信箱寄一封信到 crossonmidnight@gmail.com ，就算驗證成功';
                        }
                        response.isValidate = false;
                        return res.json(response);
                    }
                }).error(function(err) {
                    console.error('login Applicant.find error', err);
                    slackbot.phantom("[member.js login Applicant.find(where) error] : " + err, req);
                    res.status(500).json({
                        error: true
                    });
                });
            } else {
                // username is correct, then check password is correct
                if (user.password !== passwordHash(password)) {
                    // username is correct, but password is not correct
                    req.session.isLogin = false;
                    response.isLogin = false;
                    response.msg = '帳號與密碼組合錯誤';
                    return res.json(response);
                }
                letMeLogin(user, req, res, response);
            }
        }, halt_time);
    }).error(function(err) {
        console.error('login Member.find error: ', err);
        slackbot.phantom("[member.js login Member.find(where).error] : " + err, req);
        res.json({
            isLogin: false
        });
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

exports.status = function(req, res) {
    var response = {
        isLogin: false,
        talks: 0,
        newsUnread: 0,
        fb_login: {
            status: false
        }
    };

    if ((!_.has(req.session, 'isLogin')) || !req.session.isLogin) {
        return res.json(response);
    }

    response.isLogin = req.session.isLogin;

    if (req.session.facebook) {
        response.fb_login = req.session.facebook;
        response.fb_login.status = true;
    }

    var id = req.session.user.id;
    var now = moment().format('L');

    var memberlog_sql = 'select `dcard`, `news` from `member_log` where `id` = ' + id + ' limit 1';
    var memberlog = {};

    Promise.resolve(sequelize.query(memberlog_sql)).then(function(results) {
        memberlog = results ? results[0] : {};

        var news = 0;//moment(memberlog.news).utc().format('YYYY-MM-DD HH:mm:ss');

        var notification_sql = 'SELECT COUNT(*) AS `count` FROM `news` WHERE `member_id` = ' + id + ' AND `updatedAt` > "' + news + '" LIMIT 1';
        var match_sql = 'select * from `match` where member_id = ' + id + ' and date = "' + getToday() + '" limit 1';

        var tasks = {
            notification: sequelize.query(notification_sql),
            match: sequelize.query(match_sql)
        };

        return Promise.props(tasks);
    }).then(function(results) {
        response.memberlog = _.pick(memberlog, 'news', 'dcard');
        response.has_dcard = !!results.match.length;
        response.dcard = true;

        response.newsUnread = results.notification ? results.notification[0].count : 0;

        //if (memberlog.dcard) {
            //var dcard = moment(memberlog.dcard).format('L');
            //response.dcard = (now !== dcard);
        //}

        response.user = {
            username: req.session.user.username,
            user: req.session.user.user,
            level: req.session.user.level,
            school: req.session.user.school,
            department: req.session.user.department,
            gender: req.session.user.gender,
            birthday: req.session.user.birthday,
            photo: photoPrefix + req.session.user.photo,
            schoolValidated: Boolean(req.session.user.user),
            usualmail: req.session.user.usualmail,
            pie: req.session.user.password === '' //pie: password is empty
        };

        res.json(response);
    });
};

exports.logout = function(req, res) {
    req.session.destroy(function() {
        res.json({
            isLogin: false
        });
    });
};
