/* eslint-env node */
const md = require('markdown-it');
const { expand } = require('@emmetio/expand-abbreviation');

const Prism = require('prismjs/components/prism-core');
const components = require('prismjs/components/index');

// Load all components
components();

module.exports = md({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    return `<pre class="language-${lang}"><code class="language-${lang}">${Prism.highlight(str, Prism.languages[lang], lang)}</code></pre>`;
  },
})
  .use(require('markdown-it-deflist'))
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-abbr'))
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-attrs'))
  .use(require('markdown-it-container'), 'emmet', {
    marker: '!',
    validate(params) {
      return expand(params).split('</').length === 2;
    },
    render(tokens, idx) {
      let token = tokens[idx];

      if (token.nesting === 1) {
        const expanded = expand(token.info);
        const closing = expanded.lastIndexOf('</');
        return expanded.substring(0, closing);
      }
      while (token.info === '') {
        idx--;
        token = tokens[idx];
      }
      const expanded = expand(token.info);
      const closing = expanded.lastIndexOf('</');
      return expanded.substring(closing, expanded.length);
    },
  });
