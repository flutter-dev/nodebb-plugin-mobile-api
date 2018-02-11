"use strict";

var plugin = {};

plugin.init = function(params, callback) {
	var router = params.router,
		hostMiddleware = params.middleware;
	
	require('./routes')(router, hostMiddleware);
	require('./routes/admin')(router, hostMiddleware);
	callback();
};

plugin.addMenuItem = function(custom_header, callback) {
	custom_header.plugins.push({
		route: '/plugins/mobile-api',
		icon: 'fa-cogs',
		name: 'Mobile API'
	});

	callback(null, custom_header);
};


// plugin.getFields =  function(data, callback) {
// 	if(data.posts && data.posts.length) {
// 		for(var i = 0; i < data.posts.length; i++) {
// 			data.posts[i]['contentRaw'] = data.posts[i]['content'];
// 		}
// 	}
// 	if(data.fields && data.fields.length) {
// 		data.fields.concat(['contentRaw']);
// 	}
// 	callback(null, data);
// };

plugin.parseSignature = function (data, callback) {
	if(data && data.userData && data.userData.signature !== undefined) {
		data.userData.contentRaw == data.userData.signature;
	}
	callback(null, data);
};

module.exports = plugin;