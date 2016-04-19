
exports.index = function(req, res) {
    if (req.originalUrl.indexOf('/admin/') === 0 ) {
        res.render('index');
    } else {
        res.status(404).json({
            error: true,
            msg: 'not found'
        });
    }
};

