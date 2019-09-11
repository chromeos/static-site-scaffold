const ChromeLauncher = require('chrome-launcher');

/**
 * Create and launch an instance of Chrome Launcher
 *
 * @param {object} opts - The options to pass to Chrome Launcher. Defaults to an object including the headless flag
 * @return {object} An instance of Chrome Launcher
 */
function startChrome(opts = { chromeFlags: ['--headless'] }) {
  return ChromeLauncher.launch({ chromeFlags: opts.chromeFlags });
}

module.exports = {
  startChrome,
};
