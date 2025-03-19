import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';

import { router } from './routes.js';

interface Input {
    startUrls: string[];
}

await Actor.init();

const {
    startUrls,
} = await Actor.getInput<Input>() ?? {} as Input;

const proxyConfiguration = await Actor.createProxyConfiguration();

const crawler = new CheerioCrawler({
    proxyConfiguration,
    requestHandler: router,
});

await crawler.run(startUrls);

await Actor.exit();
