
const logger = require('ournet.logger');

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
    logger.loggly({
		tags: ['horoscope-generator', 'app'],
		json: true
	});
	logger.removeConsole();
}

export default {
    info(...meta: any[]) {
        logger.info(meta);
    },
    warn(...meta: any[]) {
        logger.warn(meta);
    },
    error(...meta: any[]) {
        logger.error(meta);
    },
}
