'use strict';
/* globals $, app, socket */

define('admin/plugins/mobile-api', ['settings'], function(Settings) {

	var ACP = {};

	ACP.init = function() {
		Settings.load('mobile-api', $('.mobile-api-settings'));

		$('#save').on('click', function() {
			Settings.save('mobile-api', $('.mobile-api-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'mobile-api-saved',
					title: 'Settings Saved',
					message: 'Please reload your NodeBB to apply these settings',
					clickfn: function() {
						socket.emit('admin.reload');
					}
				});
			});
		});
	};

	return ACP;
});