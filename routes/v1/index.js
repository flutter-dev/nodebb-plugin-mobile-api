var express = require('express');

module.exports = function(app, middleware) {
    //app.use('/posts', require('./posts')(express.Router(), middleware));
    app.use('/topics', require('./topics')(express.Router(), middleware))
    return app;
};