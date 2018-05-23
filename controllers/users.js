const async = require('async');
const User = require.main.require('./src/user');
const UsersController = require.main.require('./src/controllers/users');

module.exports = {
    getUserById: function getUserById(uid, selfUid, callback) {
        User.getUsersWithFields([uid], [
            'uid', 'username', 'userslug', 'picture', 'status',
            'topiccount', 'reputation', 'email:confirmed', 'lastonline',
            'flags', 'banned', 'banned:expire', 'joindate', 'cover:url', 
            'email', 'followerCount', 'followingCount'
        ], selfUid, function(err, data) {
            callback(err, data);
        });
    },
    getUsers: function getUsers(set, uid, query, callback) {
        // var setToData = {
        //     'users:postcount': { title: '[[pages:users/sort-posts]]', crumb: '[[users:top_posters]]' },
        //     'users:reputation': { title: '[[pages:users/sort-reputation]]', crumb: '[[users:most_reputation]]' },
        //     'users:joindate': { title: '[[pages:users/latest]]', crumb: '[[global:users]]' },
        //     'users:online': { title: '[[pages:users/online]]', crumb: '[[global:online]]' },
        //     'users:banned': { title: '[[pages:users/banned]]', crumb: '[[user:banned]]' },
        //     'users:flags': { title: '[[pages:users/most-flags]]', crumb: '[[users:most_flags]]' },
        // };
    
        // if (!setToData[set]) {
        //     setToData[set] = { title: '', crumb: '' };
        // }
    
        // var breadcrumbs = [{ text: setToData[set].crumb }];
    
        // if (set !== 'users:joindate') {
        //     breadcrumbs.unshift({ text: '[[global:users]]', url: '/users' });
        // }
    
        // var page = parseInt(query.page, 10) || 1;
        // var resultsPerPage = parseInt(30, 10) || 50;
        var start = Number(query.start) || 0;
        var stop = Number(query.stop) || 30;
    
        async.waterfall([
            function (next) {
                async.parallel({
                    isAdminOrGlobalMod: function (next) {
                        User.isAdminOrGlobalMod(uid, next);
                    },
                    usersData: function (next) {
                        UsersController.getUsersAndCount(set, uid, start, stop, next);
                    },
                }, next);
            },
            function (results, next) {
                //var pageCount = Math.ceil(results.usersData.count / resultsPerPage);
                var userData = {
                    users: results.usersData.users,
                    // pagination: pagination.create(page, pageCount, query),
                    userCount: results.usersData.count,
                    // title: setToData[set].title || '[[pages:users/latest]]',
                    // breadcrumbs: helpers.buildBreadcrumbs(breadcrumbs),
                    isAdminOrGlobalMod: results.isAdminOrGlobalMod,
                };
                //userData['section_' + (query.section || 'joindate')] = true;
                next(null, userData);
            },
        ], callback);
    }
};