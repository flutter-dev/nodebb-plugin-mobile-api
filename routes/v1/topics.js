var Topics = require.main.require('./src/topics');
var topics = require('../../controllers/topics');
var errorHandler = require('../../lib/errorHandler');

module.exports =  function(app, middleware) {
    app.get('/', function(req, res) {
        var start = Number(req.query.after || 0);
        var stop = Number(start + (req.query.count || 19));
        Topics.getRecentTopics('', req.uid, start, stop, '', function(err, data) {
            if(err) {
                return errorHandler.handle(err, res);
            }
            res.status(200).json(data);
        });
    });
    app.get('/:tid', function(req, res) {
        var tid = req.params.tid;
        Topics.getTopicData(tid, function(err, topic) {
            if(err) {
                return errorHandler.handle(err, res);
            }
            var set = 'tid:' + tid + ':posts';
			var reverse = false;
			var sort = req.query.sort;
			if (sort === 'newest_to_oldest') {
				reverse = true;
			} else if (sort === 'most_votes') {
				reverse = true;
				set = 'tid:' + tid + ':posts:votes';
			}
            topics.getTopicWithPosts(topic, set, req.uid, 0, 999, reverse, function(err, data) {
                if(err) {
                    return errorHandler.handle(err, res);
                }
                res.status(200).json(data);
            });
        });
    });
    return app;
}