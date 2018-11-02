
import { HoroscopePeriod, HoroscopeSign, HoroscopesHelper, ReportRepository, PhraseRepository, Phrase, Report } from '@ournet/horoscopes-domain';
import logger from './logger';
import { getRandomIntInclusive } from '@ournet/domain';

export type GenerateOptions = {
    lang: string
    period: HoroscopePeriod
    datePeriod: string
    minPhrases: number
    maxPhrases: number
    maxLength: number
    minLength: number
}

export class ReportGenerator {
    constructor(private phraseRep: PhraseRepository, private reportRep: ReportRepository) { }

    async generate(options: GenerateOptions) {
        for (const sign of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
            const id = HoroscopesHelper.createReportId(options.datePeriod, options.lang, sign as HoroscopeSign);

            if (await this.reportRep.exists(id)) {
                logger.warn(`Report ${id} exists!`)
                return
            }

            const report = await this.generateReport(options, sign as HoroscopeSign);

            logger.info(`Generated report ${report.id}`);
        }
    }

    protected async generateReport(options: GenerateOptions, sign: HoroscopeSign, iteration?: number): Promise<Report> {
        iteration = iteration || 0;

        if (iteration > 5) {
            throw new Error(`Cannot generate report forL ${sign}, ${options.datePeriod}`);
        }

        const phrases = await this.selectPhrases(options, sign);
        if (phrases.length === 0) {
            return this.generateReport(options, sign, iteration + 1);
        }

        const ids = phrases.map(item => item.id);
        const textHash = HoroscopesHelper.createReportTextHash(ids);

        if (await this.reportRep.getByTextHash(textHash)) {
            return this.generateReport(options, sign, iteration + 1);
        }

        const report = HoroscopesHelper.buildReport({
            lang: options.lang,
            period: options.datePeriod,
            phrasesIds: ids,
            sign,
            text: phrases.map(item => item.text).join('\n'),
        });

        return this.reportRep.create(report);
    }

    protected async selectPhrases(options: GenerateOptions, sign: HoroscopeSign) {
        const limit = getRandomIntInclusive(options.minPhrases, options.maxPhrases);

        let phrases = await this.phraseRep.random({
            lang: options.lang,
            limit,
            period: options.period,
            sign,
        });

        if (phrases.length !== limit) {
            logger.error(`Invalid phrases number founded: ${phrases.length}`);
            return [];
        }

        return this.truncatePhrases(phrases, options.maxLength, options.minLength);
    }

    protected truncatePhrases(list: Phrase[], maxLength: number, minLength: number): Phrase[] {
        if (list[0].text.length > minLength) {
            logger.info('got minLength phrase');
            return list.slice(0, 1);
        }
        const length = list.map(item => {
            return item.text;
        }).join('\n').length;

        if (length > maxLength && list.length > 1) {
            logger.info('truncate ' + list.length);
            list.pop();
            return this.truncatePhrases(list, maxLength, minLength);
        }
        return list;
    }
}
