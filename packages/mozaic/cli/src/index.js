// The CLI's building blocks, for scripts that render charts their own way (images for social media, say):
// `import { launchBrowser, serveStatic } from '@samizdata/mozaic/cli'`.
export { browserCandidates, findBrowser, launchBrowser } from './browser.js';
export { serveStatic } from './serve.js';
