var posts = require.main.require('./src/posts');

module.exports =  function(app, middleware) {
    app.get('/', function(req, res) {
        res.send('return posts');
    });
    return app;
}