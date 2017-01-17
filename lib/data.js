'use strict';

const Horoscope = require('ournet.data.horoscope');

const horoscopeConnection = Horoscope.connect(process.env.HOROSCOPE_CONNECTION);
const horoscopeDb = Horoscope.db(horoscopeConnection);

module.exports = {
	Report: Horoscope.Report,
	report: new Horoscope.Report(horoscopeDb),
	phrase: new Horoscope.Phrase(horoscopeDb),
	connection: horoscopeConnection
};
