var adminlist = require('../admin/adminlist.js');

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

    if (adminlist.indexOf(id) !== -1) {
        return next();
    } else {
        return res.status(401).json({
            err: "No auth"
        });
    }
};
