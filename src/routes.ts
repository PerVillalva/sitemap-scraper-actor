import { createCheerioRouter, Dataset } from 'crawlee';

export const router = createCheerioRouter();

// Utility function to extract and clean sitemap data
const extractSitemapData = ($: cheerio.Root) => {
    return $('urlset url')
        .map((_: number, el: cheerio.Element) => {
            const url = $(el).find('loc').text();
            const lastModRaw = $(el).find('lastmod').text();
            const cleanedLastMod = lastModRaw ? lastModRaw.split('T')[0] : null;
            return cleanedLastMod ? { url, lastMod: cleanedLastMod } : { url };
        })
        .get();
};

router.addDefaultHandler(async ({ request, enqueueLinks, log, $ }) => {
    log.debug(`Enqueueing pagination: ${request.url}`);

    if (!$('sitemapindex').length) {
        log.info('Extracting Sitemap URLs');
        const sitemapData = extractSitemapData($);
        log.info('Pushing data to Dataset');
        await Dataset.pushData(sitemapData);
    } else {
        const urlsArr = $('sitemap')
            .map((_, el) => $(el).find('loc').text())
            .get();
        log.info(`Found ${urlsArr.length} sitemap URLs.`);
        await enqueueLinks({
            urls: urlsArr,
            label: 'LIST',
        });
    }
});

router.addHandler('LIST', async ({ request, $, log }) => {
    const sitemapData = extractSitemapData($);
    log.info(`Extracting data: ${request.url}`);
    await Dataset.pushData(sitemapData);
});
