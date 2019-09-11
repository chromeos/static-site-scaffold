const markdown = require('./lib/markdown');
// const nunjucks = require('./lib/nunjucks');

module.exports = function(config) {
  config.setLibrary('md', markdown);
  // config.setLibrary('njk', nunjucks);

  return {
    dir: {
      input: 'src',
      output: 'public',
      includes: '_components',
      layouts: '_layouts',
    },
    dataTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateEngineOverride: 'njk',
  };
};
