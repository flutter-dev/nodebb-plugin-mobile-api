var async = require('async');
var users = require('../../controllers/users');
var errorHandler = require('../../lib/errorHandler');
var posts = require('../../controllers/posts');
var topics = require('../../controllers/topics');
// var Topics = require.main.require('./src/topics');

module.exports = function(app, middleware) {
    app.get('/:uid', function(req, res) {
        var uid = req.params.uid;
        users.getUserById(uid, req.id, function(err, data) {
            if(err) {
                return errorHandler.handle(err, res);
            }
            res.status(200).json(data[0]);
        });
    });
    app.get('/:uid/bookmarks', function(req, res) {
        posts.getPostSummariesFromSet('uid:' + req.params.uid + ':bookmarks', req.params.uid, 0, 999, function(err, results) {
            if(err) {
                return errorHandler.handle(err, res);
            }
            async.map(results.posts, function(val, next) {
                topics.getTopic(val.tid, function(err, topic) {
                    if(err) {
                        next(err);
                    } else {
                        topic.user = topic.posts[0].user;
                        next(null, topic);
                    }
                })
            }, function(err, results) {
                if(err) {
                    return errorHandler.handle(err, res);
                }
                res.status(200).json(results);
            });
        });
    });
    app.get('/:uid/posts', function(req, res) {
        posts.getPostSummariesFromSet('uid:' + req.params.uid + ':posts', req.params.uid, 0, 999, function(err, results) {
            if(err) {
                return errorHandler.handle(err, res);
            }
            res.status(200).json(results);
        });
    });
    app.get('/', function(req, res) {
        users.getUsers('users:joindate', req.uid, req.query, function(err, results) {
            if(err) {
                return errorHandler.handle(err, res);
            }
            res.status(200).json(results);
        });
    });
    return app;
}