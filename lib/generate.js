'use strict';

const Promise = require('bluebird');
const logger = require('./logger');
const Data = require('./data');
const internal = {};

module.exports = function(lang, period, options) {
	options = options || { minPhrases: 2, maxPhrases: 2 };
	return Promise.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], function(sign) {
		const data = {
			lang: lang,
			period: period,
			sign: sign
		};

		return internal.generate(data, options);
	});
};

internal.generate = function(data, options) {
	const id = Data.Report.createId(data);

	return Data.report.one({ where: { _id: id } })
		.then(dbReport => {
			if (dbReport) {
				logger.info('Report exists: ' + id);
				return dbReport;
			}
			logger.info('Creating report', data);
			return Data.report.generate(Data.phrase, data, options);
		});
};
