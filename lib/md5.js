var crypto = require('crypto');

exports.passwordHash = function(data) {
    var key = "ssarcandy";
    data = data + key;
    var md5ed = crypto.createHash('md5').update(data).digest("hex");
    return md5ed.substring(0, 12);
};

exports.photoHash = function(id) {
    var key = ".jpg";
    id = id + key;
    var md5ed = crypto.createHash('md5').update(id).digest("hex");
    return md5ed.substring(0, 8) + ".jpg";
};