/* eslint-env node */
const Nunjucks = require('nunjucks');
const path = require('path');

module.exports = new Nunjucks.Environment(new Nunjucks.FileSystemLoader(path.join(__dirname, '../src/_layouts')));
