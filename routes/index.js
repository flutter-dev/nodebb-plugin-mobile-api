var express = require('express');

module.exports = function(app, middleware) {
    app.use('/api/mobile/v1', require('./v1')(express.Router(), middleware));
    return app;
}