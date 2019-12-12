# Static Site Scaffold

The Static Site Scaffold is an opinionated configuration of [Eleventy](https://www.11ty.io) for HTML compiling and templating, [Rollup](https://rollupjs.org/) for JavaScript compiling and optimization, [Gulp](https://gulpjs.com/) for [Sass](https://sass-lang.com/) compiling and asset optimization, designed to allow you to build fast, optimized Progressive Web Apps using familiar technology. The scaffolding is set up to be CI-ready, including relevant linting and testing, including [Lighthouse](https://github.com/GoogleChrome/lighthouse) tests. Finally, it includes configuration to deploy to [Firebase Hosting](https://firebase.google.com/docs/hosting).

## Usage

While you can use the configuration module on its own, the easiest way to get started is by pulling in the whole scaffolding:

```bash
npx degit chromeos/static-site-scaffold my-awesome-site
```

This will download the latest version of the scaffolding files and put them into a new folder `my-awesome-site`. You should then `cd` into that folder, `git init` it to enable version control, and run `npm install`, or equivalent.

## Internationalization and Localization

Static Site Scaffold has basic internationalization (i18n) in place by default, allowing sites to be fully localized (l10n). This means that, out-of-the-box, you're set up to build multi-lingual sites without additional configuration needed and, if you don't need it, it's straight forward to remove.

In order to create a localization, first create a folder named after the [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) for the language you want to include, and in that folder, create a JSON file of the same name that includes that ISO language code (`code`) and writing direction (`dir`) inside a `locale` object. For English, it would look like the following:

```json
{
  "locale": {
    "code": "en",
    "dir": "ltr"
  }
}
```

This will add a `locale` global variable to each page inside that folder with the correct localization information, which you can then use as needed. This will also cascade into layouts, allowing this localization information to be used throughout your site.

From there, you have two options for making localized pages: translating individual pages or generating pages from data. The former is fairly straight-forward, it's like managing any other data you may have, or you can use a tool like [GitLocalize](https://gitlocalize.com/) to assist in managing translations for you. For the later, you would use [Eleventy's pagination](https://www.11ty.dev/docs/pagination/) to generate pages based on input date. See `src/_generated/index.html` for an example that loops over all of the data in the `l10n` global data object (which contains all data from all locale JSON files) and generates a language-specific landing page for each language. In addition, the following filters have been included to make localization and internationalization easier:

- `date(locale = 'en', format = {})` - Localizes a given date. In the simplest usecase, you can use it as `{{ published | date(locale.code)}}`. Format is an object corrisponding to the options for [`toLocaleDateString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString)
- `localeURL(locale)` - Transforms a passed in URL, like Eleventy's `page.url` global, into a localized version based on the folder structure localization pattern. Simple usage would be `{{page.url | localeURL(locale.code)}}`
- `langName` - Return the ISO 639-1 language name, in the native language, for the given locale code. Simple usage would be `{{locale.code | langName}}`

## Folder Structure

```
├── src
│   ├── index.html
│   ├── typography.md
│   ├── manifest.json
│   ├── sw.js
│   ├── _components
│   │   ├── **/*.{html|njk}
│   ├── _layouts
│   │   ├── **/*.{html|njk}
│   ├── fonts
│   │   ├── **/*.{ttf|woff|woff2}
│   ├── images
│   │   ├── **/*.{jpg|png|svg|webp}
│   ├── js
│   │   ├── **/*.js
│   ├── sass
│   │   ├── **/*.scss
│   └── videos
│       └── **/*.{webm|mp4}
├── tests
│   ├── lighthouse.js
│   ├── log.js
│   └── helpers
│       └── **/*.js
├── package.json
├── package-lock.json
├── .eleventy.js
├── rollup.config.js
├── babel.config.js
├── gulpfile.js
├── firebase.json
├── LICENSE
├── README.md
├── .editorconfig
├── .prettierrc
├── .eslintrc.yml
├── .sass-lint.yml
├── .firebaserc
├── .gitignore
```

The `src` folder is where you're going to put all of your source code, which will be built to a `public` folder. The `tests` folder is where your test files and helpers will go. `.eleventy.js`, `rollup.config.js`, `babel.config.js`, and `gulpfile.js` are configuration files for their various tools, and have their configuration pulled in from the `static-site-scaffold` module so that their configuration can be versioned and updated independently from this scaffolding.
