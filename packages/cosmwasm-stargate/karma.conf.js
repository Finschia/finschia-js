const realBrowser = String(process.env.BROWSER).match(/^(1|true)$/gi);
const travisLaunchers = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  chrome_travis: {
    base: "Chrome",
    flags: ["--no-sandbox"],
  },
};

const localBrowsers = realBrowser ? Object.keys(travisLaunchers) : ["Chrome"];

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: ".",

    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ["jasmine", "karma-typescript"],
    plugins: ["karma-jasmine", "karma-chrome-launcher", "karma-typescript", "karma-spec-reporter"],
    karmaTypescriptConfig: {
      tsconfig: "./tsconfig.json",
    },
    client: {
      // leave Jasmine Spec Runner output visible in browser
      clearContext: false,
      jasmine: {
        timeoutInterval: 15000,
      },
    },

    // list of files / patterns to load in the browser
    files: [{ pattern: "src/**/*.ts" }, { pattern: "src/**/*.spec.ts" }],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      "src/**/*.ts": ["karma-typescript"],
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ["spec", "karma-typescript"],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: localBrowsers,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity,
  });
};
