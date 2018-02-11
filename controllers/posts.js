var async = require('async');
var db = require.main.require('./src/database');
var Utils = require.main.require('./src/utils');
module.exports = {
    getPostsByPids: function getPostsByPids(pids, uid, callback) {
        if (!Array.isArray(pids) || !pids.length) {
            return callback(null, []);
        }
    
        async.waterfall([
            function (next) {
                var keys = pids.map(function (pid) {
                    return 'post:' + pid;
                });
                db.getObjects(keys, next);
            },
            function (posts, next) {
                async.map(posts, function (post, next) {
                    if (!post) {
                        return next();
                    }
                    post.upvotes = parseInt(post.upvotes, 10) || 0;
                    post.downvotes = parseInt(post.downvotes, 10) || 0;
                    post.votes = post.upvotes - post.downvotes;
                    post.timestampISO = Utils.toISOString(post.timestamp);
                    post.editedISO = parseInt(post.edited, 10) !== 0 ? Utils.toISOString(post.edited) : '';
                    //Posts.parsePost(post, next);
                    next(null, post);
                }, next);
            },
            function (posts, next) {
                next(null, { posts: posts, uid: uid });
                //plugins.fireHook('filter:post.getPosts', { posts: posts, uid: uid }, next);
            },
            function (data, next) {
                if (!data || !Array.isArray(data.posts)) {
                    return next(null, []);
                }
                data.posts = data.posts.filter(Boolean);
                next(null, data.posts);
            },
        ], callback);
    }
}