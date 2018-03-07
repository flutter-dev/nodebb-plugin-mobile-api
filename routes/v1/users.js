var users = require('../../controllers/users');
var errorHandler = require('../../lib/errorHandler');

module.exports = function(app, middleware) {
    app.get('/:uid', function(req, res) {
        var uid = req.params.uid;
        users.getUserById(uid, req.id, function(err, data) {
            if(err) {
                return errorHandler.handle(err, res);
            }
            res.status(200).json(data);
        });
        // User.getUsersWithFields([uid], [
        //     'uid', 'username', 'userslug', 'picture', 'status',
        //     'topiccount', 'reputation', 'email:confirmed', 'lastonline',
        //     'flags', 'banned', 'banned:expire', 'joindate', 'cover:url', 
        //     'email', 'followerCount', 'followingCount'
        // ], req.uid, function(err, data) {
        //     if(err) {
        //         return errorHandler.handle(err, res);
        //     }
        //     res.status(200).json(data);
        // });
    });
    return app;
}