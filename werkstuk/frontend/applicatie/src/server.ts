import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine(); // ✅ No more `getPrerenderParams`

/**
 * Serve static files from the browser folder
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle SSR Requests (Fix Render issue)
 */
app.use('*', async (req, res, next) => {
  try {
    const response = await angularApp.handle(req);
    if (response) {
      writeResponseToNodeResponse(response, res);
    } else {
      next();
    }
  } catch (error) {
    console.error('🔥 Angular SSR Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Start the server
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`🚀 Node Express server running at http://localhost:${port}`);
  });
}

/**
 * Request handler for Angular CLI and Firebase Cloud Functions
 */
export const reqHandler = createNodeRequestHandler(app);
