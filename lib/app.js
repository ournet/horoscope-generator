'use strict';

require('dotenv').load();

const Promise = require('bluebird');
const logger = require('./logger');
const moment = require('moment');
const Data = require('./data');

const LANGUAGES = (process.env.LANGUAGES || 'ro').split(/,; /g);
const START_TIME = Date.now();
const internal = {};

logger.warn('START', LANGUAGES);

Promise.each(LANGUAGES, function(lang) {
		const today = moment(START_TIME);
		const tomorrow = moment(START_TIME).add(1, 'days');

		return Promise.each([today, tomorrow], function(date) {
			return Promise.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], function(sign) {
				const data = {
					lang: lang,
					period: 'D' + date.format('YYYYMMDD'),
					sign: sign
				};

				return internal.generate(data);
			});
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



internal.generate = function(data) {
	const id = Data.Report.createId(data);

	return Data.report.one({ where: { _id: id } })
		.then(dbReport => {
			if (dbReport) {
				logger.info('Report exists: ' + id);
				return dbReport;
			}
			logger.info('Creating report', data);
			return Data.report.generate(Data.phrase, data, { minPhrases: 2, maxPhrases: 2 });
		});
};
