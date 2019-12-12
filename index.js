if (process.env.NODE_ENV === "production") {
  module.exports = require("./dist/lcrew-forms-base.min.js");
} else {
  module.exports = require("./dist/lcrew-forms-base.dev.js");
}