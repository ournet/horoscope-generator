
import { Report } from '@ournet/horoscopes-domain';
import logger from './logger';
import { createQueryApiClient, executeApiClient } from './data';
import { HoroscopeGenerateReportsParamsStringFields } from '@ournet/api-client';

export type GenerateOptions = {
    lang: string
    period: string
}

export class ReportGenerator {
    constructor() { }

    async generate(options: GenerateOptions) {

        const api = createQueryApiClient<{ reports: Report[] }>();

        api.horoscopesGenerateReports('reports', { fields: HoroscopeGenerateReportsParamsStringFields }, { params: options });

        try {
            const data = await executeApiClient(api);

            if (data.reports) {
                logger.info(`Generated reports ${data.reports.length}`);
            } else {
                logger.warn(`Not generated report: `, options);
            }
        } catch (e) {
            logger.error(e);
        }
    }
}
