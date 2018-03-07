const User = require.main.require('./src/user');

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
    }
};