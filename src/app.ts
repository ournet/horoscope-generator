require('dotenv').load();

import logger from './logger';
import { Dictionary } from '@ournet/domain';
import { HoroscopePeriod } from '@ournet/horoscopes-domain';
import * as moment from 'moment-timezone';
import { GenerateOptions, ReportGenerator } from './generator';

const LANGUAGES = (process.env.LANGUAGES || process.env.LANGS || '').split(/[,; ]+/g);
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
        options: { minPhrases: 2, maxPhrases: 2, maxLength: 500, minLength: 250 },
        feature: 1
    },
    W: {
        format: 'YYYYWW',
        name: 'week',
        options: { minPhrases: 2, maxPhrases: 5, maxLength: 1200, minLength: 500 },
        feature: 1
    }
};

logger.warn('START', LANGUAGES);

async function start() {

    const generator = new ReportGenerator();

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
                    lang,
                    period: period + date.format(interval.format),
                };

                await generator.generate(options);

                date.add(1, interval.name as moment.DurationInputArg2);
            }
        }
    }
}

start()
    .then(() => console.log('DONE!'))
    .catch(e => console.error(e));
