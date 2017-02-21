'use strict';

require('dotenv').load();

const Promise = require('bluebird');
const logger = require('./logger');
const moment = require('moment');
const Data = require('./data');
const generate = require('./generate');

const LANGUAGES = (process.env.LANGUAGES || process.env.LANGS || 'ro ru').split(/,; /g);
const START_TIME = Date.now();
const INTERVALS = {
	D: {
		format: 'YYYYMMDD',
		name: 'days',
		options: { minPhrases: 2, maxPhrases: 2, maxLength: 600, minLength: 300 },
		feature: 1
	},
	W: {
		format: 'YYYYWW',
		name: 'days',
		options: { minPhrases: 3, maxPhrases: 5, maxLength: 1200, minLength: 500 },
		feature: 1
	}
};

logger.warn('START', LANGUAGES);

Promise.each(LANGUAGES, function(lang) {
		const paramsList = [];
		Object.keys(INTERVALS).forEach(prefix => {
			const interval = INTERVALS[prefix];
			const date = moment(START_TIME);
			for (let i = 0; i <= interval.feature; i++) {
				paramsList.push({
					lang: lang,
					period: prefix + date.format(interval.format),
					options: interval.options
				});
				date.add(i + 1, interval.name);
			}
		});

		return Promise.each(paramsList, params => {
			return generate(params.lang, params.period, params.options);
		});
	})
	.then(function() {
		logger.warn('END');
	})
	.catch(function(e) {
		logger.error(e);
	})
	.finally(function() {
		return Data.connection.close();
	});
