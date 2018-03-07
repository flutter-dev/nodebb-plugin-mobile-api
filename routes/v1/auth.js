const Auth = require.main.require('./src/routes/authentication');
//var Controllers = require.main.require('./src/controllers');
const auth = require('../../controllers/auth');
//const errorHandler = require('../../lib/errorHandler');

module.exports = function(app, middleware) {
    app.post('/login', Auth.middleware.applyBlacklist, auth.login);

    app.post('/register', function(req, res) {
        res.status(200).json({});
    });
    return app;
}