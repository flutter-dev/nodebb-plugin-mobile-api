var express = require('express');

module.exports = function(app, middleware) {
    app.use('/auth', require('./auth')(express.Router(), middleware));
    app.use('/users', require('./users')(express.Router(), middleware));
    app.use('/topics', require('./topics')(express.Router(), middleware));
    return app;
};