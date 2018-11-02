require('dotenv').load();

import { PhraseRepositoryBuilder, ReportRepositoryBuilder } from '@ournet/horoscopes-data';
import { createDb, closeConnection } from './data';
import { logger } from './logger';
import { Dictionary } from '@ournet/domain';
import { HoroscopePeriod } from '@ournet/horoscopes-domain';
import * as moment from 'moment-timezone';
import { GenerateOptions, ReportGenerator } from './generator';

const LANGUAGES = (process.env.LANGUAGES || process.env.LANGS || 'ro ru bg').split(/[,; ]+/g);
const START_TIME = Date.now();
const INTERVALS: Dictionary<{
    format: string,
    name: string,
    options: { minPhrases: number, maxPhrases: number, maxLength: number, minLength: number },
    feature: number
}> = {
    D: {
        format: 'YYYYMMDD',
        name: 'days',
        options: { minPhrases: 2, maxPhrases: 2, maxLength: 600, minLength: 250 },
        feature: 1
    },
    W: {
        format: 'YYYYWW',
        name: 'days',
        options: { minPhrases: 2, maxPhrases: 5, maxLength: 1200, minLength: 500 },
        feature: 1
    }
};

logger.warn('START', LANGUAGES);

const CONNECTION_STRING = process.env.CONNECTION_STRING || '';

if (!CONNECTION_STRING) {
    throw new Error(`CONNECTION_STRING is required!`);
}

async function start() {
    const db = await createDb(CONNECTION_STRING);
    const phraseRep = PhraseRepositoryBuilder.build(db);
    const reportRep = ReportRepositoryBuilder.build(db);
    await phraseRep.createStorage();
    await reportRep.createStorage();

    const generator = new ReportGenerator(phraseRep, reportRep);

    for (const lang of LANGUAGES) {
        for (const period of Object.keys(INTERVALS) as HoroscopePeriod[]) {
            const interval = INTERVALS[period];
            const date = moment(START_TIME);
            const days: number[] = []
            for (let i = 0; i <= interval.feature; i++) {
                days.push(1);
            }
            for (const _i of days) {
                const options: GenerateOptions = {
                    ...interval.options,
                    lang,
                    datePeriod: period + date.format(interval.format),
                    period,
                };

                await generator.generate(options);

                date.add(1, interval.name as moment.DurationInputArg2);
            }
        }
    }
}

start()
    .then(() => console.log('DONE!'))
    .catch(e => console.error(e))
    .then(() => closeConnection());
