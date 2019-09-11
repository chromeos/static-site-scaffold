const lighthouse = require('lighthouse');

/**
 * Runs Lighthouse for the given URL
 *
 * @param {string} url - The URL to run Lighthouse against
 * @param {object} chrome - An instance of Chrome Launcher
 * @param {object} config - Config to pass to Lighthouse
 *
 * @return {object} Lighthouse results
 */
async function runLighthouse(url, chrome, config = null) {
  // Need to include port in options!
  const opts = {
    port: chrome.port,
  };
  const results = await lighthouse(url, opts, config);
  return results.lhr;
}

/**
 * Reusable Audit Checker for URLs
 *
 * @param {object} t - AVA's test object
 * @param {object} results - A results object from Lighthouse
 */
function auditCheck(t, results) {
  const { audits, categories } = results;

  Object.keys(categories).forEach(c => {
    if (c !== 'pwa') {
      const { score, title } = categories[c];
      t.assert(score >= 0.9, `${title} is 90% is better`);
    }
  });

  // Individual Audits
  const importantAudits = {
    interactive: 5000,
  };

  Object.keys(importantAudits).forEach(a => {
    const audit = audits[a];
    t.assert(audit.numericValue < importantAudits[a], `${audit.title} < ${importantAudits[a]}ms`);
  });
}

/**
 * Reusable AVA Test Macro to run Lighthouse audits for given URLs
 *
 * @param {object} t - AVA's test object
 * @param {string} url - A URL to test
 */
async function macro(t, url) {
  const results = await runLighthouse(`http://localhost:8080/${url}`, t.context.chrome);
  auditCheck(t, results);
}

macro.title = (title = 'lighthouse -', url, name) => `${title} ${name}`;

module.exports = {
  runLighthouse,
  auditCheck,
  lighthouse: macro,
};
