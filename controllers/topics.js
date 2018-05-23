var async = require('async');
var Topics = require.main.require('./src/topics');
var Posts = require.main.require('./src/posts');
var Categories = require.main.require('./src/categories');
var Social = require.main.require('./src/social');
var Utils = require.main.require('./src/utils');
var posts = require('./posts');
module.exports = {
    getMainPostAndReplies: function getMainPostAndReplies(topic, set, uid, start, stop, reverse, callback) {
        async.waterfall([
            function (next) {
                if (stop > 0) {
                    stop -= 1;
                    if (start > 0) {
                        start -= 1;
                    }
                }
    
                Posts.getPidsFromSet(set, start, stop, reverse, next);
            },
            function (pids, next) {
                if (!pids.length && !topic.mainPid) {
                    return callback(null, []);
                }
    
                if (parseInt(topic.mainPid, 10) && start === 0) {
                    pids.unshift(topic.mainPid);
                }
                posts.getPostsByPids(pids, uid, next);
            },
            function (posts, next) {
                if (!posts.length) {
                    return next(null, []);
                }
                var replies = posts;
                if (topic.mainPid && start === 0) {
                    posts[0].index = 0;
                    replies = posts.slice(1);
                }
    
                Topics.calculatePostIndices(replies, start, stop, topic.postcount, reverse);
    
                Topics.addPostData(posts, uid, next);
            },
        ], callback);
    },
    getTopicWithPosts: function getTopicWithPosts(topicData, set, uid, start, stop, reverse, callback) {
        var self = this;
        async.waterfall([
            function (next) {
                async.parallel({
                    posts: async.apply(self.getMainPostAndReplies, topicData, set, uid, start, stop, reverse),
                    category: async.apply(Categories.getCategoryData, topicData.cid),
                    tagWhitelist: async.apply(Categories.getTagWhitelist, [topicData.cid]),
                    // threadTools: async.apply(plugins.fireHook, 'filter:topic.thread_tools', { topic: topicData, uid: uid, tools: [] }),
                    isFollowing: async.apply(Topics.isFollowing, [topicData.tid], uid),
                    isIgnoring: async.apply(Topics.isIgnoring, [topicData.tid], uid),
                    bookmark: async.apply(Topics.getUserBookmark, topicData.tid, uid),
                    postSharing: async.apply(Social.getActivePostSharing),
                    // deleter: async.apply(getDeleter, topicData),
                    // merger: async.apply(getMerger, topicData),
                    related: function (next) {
                        async.waterfall([
                            function (next) {
                                Topics.getTopicTagsObjects(topicData.tid, next);
                            },
                            function (tags, next) {
                                topicData.tags = tags;
                                Topics.getRelatedTopics(topicData, uid, next);
                            },
                        ], next);
                    },
                }, next);
            },
            function (results, next) {
                topicData.posts = results.posts;
                topicData.category = results.category;
                topicData.tagWhitelist = results.tagWhitelist[0];
                // topicData.thread_tools = results.threadTools.tools;
                topicData.isFollowing = results.isFollowing[0];
                topicData.isNotFollowing = !results.isFollowing[0] && !results.isIgnoring[0];
                topicData.isIgnoring = results.isIgnoring[0];
                topicData.bookmark = results.bookmark;
                topicData.postSharing = results.postSharing;
                // topicData.deleter = results.deleter;
                topicData.deletedTimestampISO = Utils.toISOString(topicData.deletedTimestamp);
                // topicData.merger = results.merger;
                topicData.mergedTimestampISO = Utils.toISOString(topicData.mergedTimestamp);
                topicData.related = results.related || [];
    
                topicData.unreplied = parseInt(topicData.postcount, 10) === 1;
                topicData.deleted = parseInt(topicData.deleted, 10) === 1;
                topicData.locked = parseInt(topicData.locked, 10) === 1;
                topicData.pinned = parseInt(topicData.pinned, 10) === 1;
    
                topicData.upvotes = parseInt(topicData.upvotes, 10) || 0;
                topicData.downvotes = parseInt(topicData.downvotes, 10) || 0;
                topicData.votes = topicData.upvotes - topicData.downvotes;
                next(null,  { topic: topicData, uid: uid });
                //topicData.icons = [];
    
                //plugins.fireHook('filter:topic.get', { topic: topicData, uid: uid }, next);
            },
            function (data, next) {
                next(null, data.topic);
            },
        ], callback);
    },
    getTopic: function getTopic(tid, callback) {
        var self = this;
        Topics.getTopicData(tid, function(err, topic) {
            if(err) {
                return callback(err);
            }
            var set = 'tid:' + tid + ':posts';
			//var reverse = false;
			// var sort = req.query.sort;
			// if (sort === 'newest_to_oldest') {
			// 	reverse = true;
			// } else if (sort === 'most_votes') {
			// 	reverse = true;
			// 	set = 'tid:' + tid + ':posts:votes';
			// }
            self.getTopicWithPosts(topic, set, '', 0, 999, false, callback);
        });
    }
}