var async = require('async');
var db = require.main.require('./src/database');
var Utils = require.main.require('./src/utils');
var Privileges = require.main.require('./src/privileges');
var Topics = require.main.require('./src/topics');
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
                    //post.isMainPost = post.topic && parseInt(post.pid, 10) === parseInt(post.topic.mainPid, 10);
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
    },
    getPostSummariesFromSet(set, uid, start, stop, callback) {
        var self = this;
        async.waterfall([
            function (next) {
                db.getSortedSetRevRange(set, start, stop, next);
            },
            function (pids, next) {
                Privileges.posts.filter('read', pids, uid, next);
            },
            function (pids, next) {
                self.getPostsByPids(pids, uid, next);
            },
            function(posts, next) {
                var tids = posts.map(function(post) {
                    return post.tid;
                });
                async.waterfall([
                    function(next) {
                        Topics.getTopicsFields(tids, ['tid', 'mainPid'], next);
                    },
                    function(results, next) {
                        var map = {};
                        results.forEach(function(res) {
                            map[res.tid] = res.mainPid;
                        });
                        async.map(posts, function(post, next) {
                            post.isMainPost = parseInt(post.pid, 10) === parseInt(map[post.tid], 10);
                            next(null, post);
                        }, next);
                    }
                ], next);
            },
            function (posts, next) {
                next(null, { posts: posts, nextStart: stop + 1 });
            },
        ], callback);
    },
}