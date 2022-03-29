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
    // registers plugins but does not activate them
    plugins: ["karma-jasmine", "karma-chrome-launcher", "karma-typescript", "karma-spec-reporter"],

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine", "karma-typescript"],
    karmaTypescriptConfig: {
      tsconfig: "./tsconfig.json",
    },

    // list of files / patterns to load in the browser
    files: [{ pattern: "src/*.ts" }, { pattern: "src/*.spec.ts" }],

    client: {
      // leave Jasmine Spec Runner output visible in browser
      clearContext: false,
    },
    // client: {
    //   jasmine: {
    //     random: false,
    //     timeoutInterval: 15000,
    //   },
    // },

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      "src/**/*.ts": ["karma-typescript"],
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["spec", "karma-typescript"],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: localBrowsers,

    browserNoActivityTimeout: 90000,

    // Keep brower open for debugging. This is overridden by yarn scripts
    singleRun: true,
  });
};
