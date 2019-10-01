# Static Site Scaffold

The Static Site Scaffold is an opinionated configuration of [Eleventy](https://www.11ty.io) for HTML compiling and templating, [Rollup](https://rollupjs.org/) for JavaScript compiling and optimization, [Gulp](https://gulpjs.com/) for [Sass](https://sass-lang.com/) compiling and asset optimization, designed to allow you to build fast, optimized Progressive Web Apps using familiar technology. The scaffolding is set up to be CI-ready, including relevant linting and testing, including [Lighthouse](https://github.com/GoogleChrome/lighthouse) tests. Finally, it includes configuration to deploy to [Firebase Hosting](https://firebase.google.com/docs/hosting).

## Usage

While you can use the configuration module on its own, the easiest way to get started is by pulling in the whole scaffolding:

```bash
npx degit chromeos/static-site-scaffold my-awesome-site
```

This will download the latest version of the scaffolding files and put them into a new folder `my-awesome-site`. You should then `cd` into that folder, `git init` it to enable version control, and run `npm install`, or equivalent.

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
