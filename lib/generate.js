'use strict';

const debug = require('debug')('horoscope-generator');
const Promise = require('bluebird');
const _ = require('lodash');
const logger = require('./logger');
const Data = require('./data');
const internal = {};

module.exports = function (lang, period, options) {
	options = options || { minPhrases: 2, maxPhrases: 2 };
	return Promise.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], function (sign) {
		const data = {
			lang: lang,
			period: period,
			sign: sign,
			numbers: internal.generateNumbers(6),
			stats: internal.generateStats()
		};

		return internal.generate(data, options);
	});
};

internal.generate = function (data, options) {
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
internal.generateReport = function (data, options, iteration) {

	const self = this;
	const period = data.period.substr(0, 1);
	iteration = iteration || 0;
	options = _.defaults({}, options);
	options = _.defaults(options, { minPhrases: 1, maxPhrases: 3, maxLength: 2000 });
	return Data.phrase.count({ lang: data.lang, sign: data.sign, period: period })
		.then(totalPhrases => {
			if (totalPhrases < 50) {
				return logger.error('Too few phrases', { count: totalPhrases, lang: data.lang, sign: data.sign, period: period });
				// return Promise.reject(new Error('Too few phrases: ' + totalPhrases));
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
					phrases = internal.truncPhrases(phrases, options.maxLength, options.minLength);

					data.text = phrases.map(item => {
						return item.text;
					}).join('\n');

					data.phrasesIds = phrases.map(item => {
						return item.id;
					});

					return Data.report.create(data)
						.catch(e => {
							if (iteration < 3) {
								logger.error(e);
								return internal.generateReport(data, options, ++iteration);
							}
							return Promise.reject(e);
						});
				});
		});
};

internal.truncPhrases = function (list, maxLength, minLength) {
	if (list[0].text.length > minLength) {
		debug('got minLength phrase');
		return [list[0]];
	}
	const length = list.map(item => {
		return item.text;
	}).join('\n').length;

	if (length > maxLength && list.length > 1) {
		debug('truncate ' + list.length);
		list.pop();
		return internal.truncPhrases(list, maxLength);
	}
	return list;
};

internal.randomInt = function (min, max) {
	min = min || 1;
	max = max || 99999;
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

internal.generateNumbers = function (count) {
	const numbers = [];
	for (var i = 0; i < count; i++) {
		let number;
		do {
			number = internal.randomInt(1, 49);
		} while (numbers.indexOf(number) > -1)
		numbers.push(number);
	}

	return numbers;
}

internal.generateStats = function () {
	return {
		health: internal.randomInt(15, 90),
		love: internal.randomInt(15, 90),
		success: internal.randomInt(15, 90),
	};
}
