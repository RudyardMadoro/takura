import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const publicSiteMode = (process.env['TAKURA_PUBLIC_SITE_MODE'] || 'DEMO').toUpperCase();
const nonProduction = publicSiteMode !== 'PRODUCTION';

app.disable('x-powered-by');
app.use((_req, res, next) => {
  if (nonProduction) res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

const apiOrigin = (process.env['TAKURA_API_ORIGIN'] || 'http://127.0.0.1:8080').replace(/\/$/, '');
app.use('/api/v1', async (req, res, next) => {
  if (
    req.method !== 'GET' ||
    !/^\/(services|projects)(\/[^/]+)?$|^\/sitemap\.xml$|^\/public\/config$/.test(req.path)
  ) {
    return next();
  }
  try {
    const response = await fetch(
      `${apiOrigin}/api/v1${req.path}${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`,
      {
        redirect: 'manual',
      },
    );
    for (const header of ['cache-control', 'content-type', 'etag', 'location']) {
      const value = response.headers.get(header);
      if (value) res.setHeader(header, value);
    }
    return res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
  } catch {
    return res.status(503).json({ code: 'PUBLIC_CONTENT_UNAVAILABLE' });
  }
});
app.use(async (req, res, next) => {
  if (!/^\/(services|projects)\/[^/]+$/.test(req.path)) return next();
  try {
    const response = await fetch(`${apiOrigin}/api/v1${req.path}`, { redirect: 'manual' });
    if (response.status === 404) res.locals['contentStatus'] = 404;
    if (response.status === 308) {
      const location = response.headers.get('location');
      if (location) return res.redirect(308, location);
    }
  } catch {
    // The Angular error state remains renderable when the API is temporarily unavailable.
  }
  next();
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    immutable: true,
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (!response) return next();
      const status = res.locals['contentStatus'] as number | undefined;
      const rendered = status
        ? new Response(response.body, { status, headers: response.headers })
        : response;
      return writeResponseToNodeResponse(rendered, res);
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
const launchedAsBuiltServer = process.argv[1]?.replaceAll('\\', '/').endsWith('/server.mjs');
if (
  isMainModule(import.meta.url) ||
  launchedAsBuiltServer ||
  process.env['pm_id'] ||
  process.env['PORT']
) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
