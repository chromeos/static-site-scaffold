/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global Set, Promise, importScripts, languages  */
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { preferences } from './js/lib/db.js';

// TODO: You'll probably want to move from importScripts() to an ES import
// for these scripts, since you're already running this file through Rollup.
importScripts('/js/languages.js');

/**
 * Normalizes requests that end with a backslash (/) to request the same resource
 * From https://github.com/GoogleChrome/workbox/issues/2217#issuecomment-528023769
 *
 * @param {object} param0 - An object containing a Workbox request object
 * @return {request} Either the original request or a normalized request
 */
async function normalizeIfNeeded({ request }) {
  // Clean out query parameters, and add a trailing '/' if missing.
  const url = new URL(request.url);
  let cleanUrl = url.origin + url.pathname;
  if (!cleanUrl.endsWith('/')) {
    cleanUrl += '/';
  }
  return new Request(cleanUrl);
}

const includesRegExp = /(<!--\s*#include\s*virtual=['|"]\S*['|"]-->)/gm;
const includesFileRegExp = /<!--\s*#include\s*virtual=['|"](\S*)['|"]-->/gm;
const endIncludeRegExp = /<!--\s*#endinclude\s*-->/gm;
const endIncludeWithLeadingRegExp = /[\s\S]*<!--\s*#endinclude\s*-->/gm;

/**
 *
 * @param {response} param0 - The response from the cache
 */
async function serviceWorkerSideInclude({ cachedResponse }) {
  const content = await cachedResponse.text();
  const matches = [...new Set(content.match(includesRegExp))];
  const neededIncludes = await Promise.all(
    matches
      .map(i => i.split(includesFileRegExp)[1])
      .map(async key => {
        const cachedInclude = await matchPrecache(key);
        return cachedInclude.text();
      }),
  );

  const includes = {};

  matches.forEach((include, i) => (includes[include] = neededIncludes[i]));

  const rebuild = content
    .split(includesRegExp)
    .map(i => {
      if (matches.includes(i)) {
        return includes[i];
      }

      return i;
    })
    .join('');

  return new Response(rebuild, { headers: cachedResponse.headers });
}

/**
 *
 * @param {response} param0 - The response that will update the cache
 */
async function swsiSideCleanup({ response }) {
  const content = await response.text();

  const matches = content.match(includesRegExp);
  // const neededIncludes = [...new Set(matches)].map(i => i.split(includesFileRegExp)[1]);
  let open = 0;
  const rebuild = content
    .split(includesRegExp)
    .map(i => {
      // If the current item is the include and it's not included from within
      if (i === matches[0]) {
        matches.shift();
        open++;
        if (open > 1) return '';
        return i;
      }

      const endIncludeSplit = i.split(endIncludeWithLeadingRegExp);
      if (endIncludeSplit.length === 1 && open !== 0) {
        return '';
      }

      const count = i.match(endIncludeRegExp);

      open = open - (count ? count.length : 0);

      return endIncludeSplit.join('');
    })
    .join('');

  return new Response(rebuild, { headers: response.headers });
}

const navigationNormalizationPlugin = {
  cacheKeyWillBeUsed: normalizeIfNeeded,
  requestWillFetch: normalizeIfNeeded,
  cachedResponseWillBeUsed: serviceWorkerSideInclude,
  cacheWillUpdate: swsiSideCleanup,
};

precacheAndRoute(self.__WB_MANIFEST);

// HTML caching strategy
const htmlStrategy = new StaleWhileRevalidate({
  cacheName: 'pages-cache',
  plugins: [navigationNormalizationPlugin],
});

/**
 * HTML Handler
 * @param {object} param0 - Workbox Handler
 * @return {object} - Either a redirection response or a Workbox response
 */
async function htmlHandler({ event }) {
  const lang = await preferences.get('lang');
  const { request } = event;

  const urlLang = request.url.replace(self.location.origin, '').split('/');
  const currentLang = urlLang[1];
  const isALanguage = languages.includes(currentLang);
  const isRightLanguage = currentLang !== lang;
  const shouldRefresh = new URL(request.url).searchParams.get('locale_fallback') !== 'true';

  if (isALanguage && isRightLanguage && shouldRefresh) {
    console.log('⇒ Redirecting');
    urlLang[1] = lang;
    const redirectURL = `${self.location.origin}${urlLang.join('/')}`;
    return Response.redirect(redirectURL, 302);
  }

  return htmlStrategy.handle({ event, request });
}

// Handle navigation requests with htmlHandler.
registerRoute(({ request }) => request.mode === 'navigate', htmlHandler);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
  ({ request }) => request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'stylesheets',
  }),
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'webfonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  }),
);

// Images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  }),
);

setCatchHandler(({ event }) => {
  // The FALLBACK_URL entries must be added to the cache ahead of time, either via runtime
  // or precaching.
  // If they are precached, then call matchPrecache(FALLBACK_URL).
  //
  // Use event, request, and url to figure out how to respond.
  // One approach would be to use request.destination, see
  // https://medium.com/dev-channel/service-worker-caching-strategies-based-on-request-types-57411dd7652c
  switch (event.request.destination) {
    case 'document':
      return caches.match('/404');

    // case 'image':
    //   return matchPrecache(FALLBACK_IMAGE_URL);
    // break;

    // case 'font':
    //   return matchPrecache(FALLBACK_FONT_URL);
    // break;

    default:
      // If we don't have a fallback, just return an error response.
      return Response.error();
  }
});
