var mongo = require('../../models').mongo;

exports.checkLogin = function(req, res, next) {
    if (!req.session.isLogin) {
        return res.status(401).json({
            error: true,
            msg: "請登入"
        });
    }
    next();
};

exports.checkAdmin = function(req, res, next) {
    if (!req.session.isLogin) {
        return res.status(401).json({
            error: true,
            msg: "請登入"
        });
    }

    var id = req.session.user.id;

    mongo.admins.findOne({
        member_id: id
    }, function(err, isAdmin) {
        if (err || !isAdmin) {
            return res.status(401).json({
                err: "No auth"
            });
        }

        if (isAdmin.level === 'admin') {
            return next();
        }
    });
};
