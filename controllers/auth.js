const passport = require.main.require('passport'); //require vs require.main?
const helpers = require.main.require('./src/controllers/helpers');
const winston = require('winston');
const user = require.main.require('./src/user');
const users = require('./users');
const plugins = require.main.require('./src/plugins');
const meta = require.main.require('./src/meta');
const utils = require.main.require('./src/utils');
const validator = require.main.require('validator');
const authenticationController = require.main.require('./src/controllers/authentication');
function continueLogin(req, res, next) {
	passport.authenticate('local', function (err, userData, info) {
		if (err) {
			return helpers.noScriptErrors(req, res, err.message, 403);
		}

		if (!userData) {
			if (typeof info === 'object') {
				info = '[[error:invalid-username-or-password]]';
			}
			return helpers.noScriptErrors(req, res, info, 403);
		}

		var passwordExpiry = userData.passwordExpiry !== undefined ? parseInt(userData.passwordExpiry, 10) : null;

		// Alter user cookie depending on passed-in option
		if (req.body.remember === 'on') {
			var duration = 1000 * 60 * 60 * 24 * (parseInt(meta.config.loginDays, 10) || 14);
			req.session.cookie.maxAge = duration;
			req.session.cookie.expires = new Date(Date.now() + duration);
		} else {
			req.session.cookie.maxAge = false;
			req.session.cookie.expires = false;
		}

		if (passwordExpiry && passwordExpiry < Date.now()) {
			winston.verbose('[auth] Triggering password reset for uid ' + userData.uid + ' due to password policy');
			req.session.passwordExpired = true;
			user.reset.generate(userData.uid, function (err, code) {
				if (err) {
					return helpers.noScriptErrors(req, res, err.message, 403);
				}

				res.status(200).send(nconf.get('relative_path') + '/reset/' + code);
			});
		} else {
			authenticationController.doLogin(req, userData.uid, function (err) {
				if (err) {
					return helpers.noScriptErrors(req, res, err.message, 403);
                }
                users.getUserById(userData.uid, userData.uid, function(err, data) {
                    if(err) helpers.noScriptErrors(req, res, err.message, 403);
                    res.status(200).send(data[0]);
                });
                
				// var destination;
				// if (!req.session.returnTo) {
				// 	destination = nconf.get('relative_path') + '/';
				// } else {
				// 	destination = req.session.returnTo;
				// 	delete req.session.returnTo;
				// }

				// if (req.body.noscript === 'true') {
				// 	res.redirect(destination + '?loggedin');
				// } else {
				// 	res.status(200).send(destination);
				// }
			});
		}
	})(req, res, next);
}

module.exports = {
    login: function login (req, res, next) {
        if (plugins.hasListeners('action:auth.overrideLogin')) {
            return continueLogin(req, res, next);
        }

        var loginWith = meta.config.allowLoginWith || 'username-email';

        if (req.body.username && utils.isEmailValid(req.body.username) && loginWith.indexOf('email') !== -1) {
            async.waterfall([
                function (next) {
                    user.getUsernameByEmail(req.body.username, next);
                },
                function (username, next) {
                    req.body.username = username || req.body.username;
                    continueLogin(req, res, next);
                },
            ], next);
        } else if (loginWith.indexOf('username') !== -1 && !validator.isEmail(req.body.username)) {
            continueLogin(req, res, next);
        } else {
            var err = '[[error:wrong-login-type-' + loginWith + ']]';
            helpers.noScriptErrors(req, res, err, 500);
        }
	},
	logout: function logout(req, res, next) {
		authenticationController.logout(req, res, next);
	}
}
