'use strict';

const logger = module.exports = require('ournet.logger');

if (process.env.NODE_ENV === 'production') {
	logger.loggly({
		tags: ['horoscope-generator'],
		json: true
	});
	logger.removeConsole();
}
