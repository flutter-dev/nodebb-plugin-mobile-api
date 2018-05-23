var async = require('async');
var Topics = require.main.require('./src/topics');
var topics = require('../../controllers/topics');
var errorHandler = require('../../lib/errorHandler');

module.exports = function(app, middleware) {
    app.get('/', function(req, res) {
        var start = Number(req.query.after || 0);
        var stop = Number(start + (Number(req.query.count) || 19));
        Topics.getRecentTopics('', req.uid, start, stop, '', function(err, data) {
            if(err) {
                return errorHandler.handle(err, res);
            }
            res.status(200).json(data);
        });
    });

    app.get('/collection', function(req, res) {
        try {
            var tids = JSON.parse(req.query.tids || '[]');
            if(tids.length == 0) {
                res.status(200).json([]);
                return;
            }
            async.map(tids, function(tid, next) {
                topics.getTopic(tid, function(err, topic) {
                    if(err) {
                        next(err);
                        return;
                    }
                    topic.user = topic.posts[0].user;
                    next(null, topic);
                });
            }, function(err, results) {
                if(err) {
                    return errorHandler.handle(err, res);
                }
                res.status(200).json(results);
            })
        } catch(err) {
            errorHandler.handle(err, res);
        }
    })

    app.get('/:tid', function(req, res) {
        var tid = req.params.tid;
        topics.getTopic(tid, function(err, topic) {
            if(err) {
                return errorHandler.handle(err, res);
            }
            res.status(200).json(topic);
        });
    });

    
    return app;
}