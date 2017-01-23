'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
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
			return internal.generateReport(data, options);
		});
};

/**
 * Generates a Horoscope for a given lang, date & sign
 * @param  {Phrase} phraseModel Phrase model
 * @param  {Object} data        DayHoroscope data
 * @return {Object}             Created day horoscope
 */
internal.generateReport = function(data, options, iteration) {

	const self = this;
	const period = data.period.substr(0, 1);
	iteration = iteration || 0;
	options = _.defaults({}, options);
	options = _.defaults(options, { minPhrases: 1, maxPhrases: 3, maxLength: 2000 });
	return Data.phrase.count({ lang: data.lang, sign: data.sign, period: period })
		.then(totalPhrases => {
			if (totalPhrases < 50) {
				return Promise.reject(new Error('Too few phrases'));
			}
			const limit = internal.randomInt(options.minPhrases, options.maxPhrases);
			const offset = internal.randomInt(0, totalPhrases - limit);
			let order = 'rand';
			if (internal.randomInt(0, 10) < 6) {
				order = '-' + order;
			}

			return Data.phrase.list({
					where: {
						lang: data.lang,
						sign: data.sign,
						period: period
					},
					limit: limit,
					offset: offset,
					order: order
				})
				.then(phrases => {
					phrases = internal.truncPhrases(phrases, options.maxLength);

					data.text = phrases.map(item => {
						return item.text;
					}).join('\n');

					data.phrasesIds = phrases.map(item => {
						return item.id;
					});

					return Data.report.create(data).catch(e => {
						if (iteration < 3) {
							return internal.generateReport(data, options, ++iteration);
						}
						return Promise.reject(e);
					});
				});
		});
};

internal.truncPhrases = function(list, maxLength) {
	const length = list.map(item => {
		return item.text;
	}).join('\n').length;

	if (length > maxLength) {
		list.pop();
		return internal.truncPhrases(list, maxLength);
	}
	return list;
};

internal.randomInt = function(min, max) {
	min = min || 1;
	max = max || 99999;
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
