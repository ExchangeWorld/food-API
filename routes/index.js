module.exports = function(app) {
    app.use('/api', require('./api'));
    app.use('/admin', require('./admin'));

    // for clear logout
    app.get('/logout', function(req, res) {
        req.session.destroy(function() {
            res.status(201).sned();
        });
    });
};