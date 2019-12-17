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
import { log } from './lib/log';
import { preferences } from './lib/db';

window.addEventListener('DOMContentLoaded', async () => {
  const lang = document.querySelector('#lang');

  // Set default language if no language is set
  const language = await preferences.get('lang');
  if (language === undefined) {
    preferences.set('lang', lang.value);
  }

  // Redirect user if language is changed
  lang.addEventListener('change', e => {
    preferences.set('lang', e.target.value);
    window.location = document.querySelector(`link[rel="alternate"][hreflang="${e.target.value}"]`).href;
  });
});

// eslint-disable-next-line no-constant-condition
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      log('Service Worker registered! 😎');
      log(registration);
    } catch (e) {
      log('Registration failed 😫');
      log(e);
    }
  });
}
