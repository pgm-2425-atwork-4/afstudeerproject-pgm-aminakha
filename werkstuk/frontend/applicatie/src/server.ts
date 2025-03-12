import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve directories
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

// Ensure we read environment variables
require('dotenv').config();

// Convert PORT to a number and set HOST for Render
const PORT = Number(process.env['PORT']) || 7000;
const HOST = '0.0.0.0'; // ✅ Required for Render

const app = express();
const angularApp = new AngularNodeAppEngine();

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
 * Ensure the server listens to the correct port
 */
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});

/**
 * Request handler for Angular CLI and Firebase Cloud Functions
 */
export const reqHandler = createNodeRequestHandler(app);
